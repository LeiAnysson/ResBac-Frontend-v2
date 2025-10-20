import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResponderViewReport.css';
import '../Components/Shared/SharedComponents.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';
import { apiFetch } from '../utils/apiFetch';
import { reverseGeocode } from '../utils/hereApi';
import Ably from 'ably';

let hereMapsLoaded = false;

const ResponderViewReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [status, setStatus] = useState('En Route');
  const [shareLocation, setShareLocation] = useState(true);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupType, setBackupType] = useState('');
  const [backupReason, setBackupReason] = useState('');
  const [showRequestSent, setShowRequestSent] = useState(false);
  const [responderLocation, setResponderLocation] = useState(null);
  const [arrived, setArrived] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState('Loading...');
  const [debugLines, setDebugLines] = useState([]);

  const ablyPublishRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const responderMarkerRef = useRef(null);
  const incidentMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const followRef = useRef(true);
  const lastPublishedRef = useRef(0);
  const watchIdRef = useRef(null);
  const restartWatcherRef = useRef(null);
  const responderLocationRef = useRef(null); 
  const lastSentRef = useRef(null); 

  const debug = (msg) => {
    console.log(msg);
    setDebugLines((prev) => {
      const lines = [...prev, `${new Date().toLocaleTimeString()}: ${msg}`];
      return lines.slice(-30);
    });
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/responder/report/${id}`);
        if (data.success) {
          setReport(data.report);
          setStatus(data.report.status === 'assigned' ? 'En Route' : data.report.status);

          if (data.report.latitude && data.report.longitude) {
            const address = await reverseGeocode(data.report.latitude, data.report.longitude);
            setResolvedAddress(address || 'Unknown Location');
          } else {
            setResolvedAddress('—');
          }
        } else {
          console.error('Failed to fetch report:', data);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      }
    };
    fetchReport();
  }, [id]);

  useEffect(() => {
    if (!report?.latitude || !report?.longitude) return;
    if (!mapContainerRef.current) return;

    const loadHereMaps = () => {
      if (window.H) return Promise.resolve();
      if (hereMapsLoaded) return Promise.resolve();

      const scripts = [
        'https://js.api.here.com/v3/3.1/mapsjs-core.js',
        'https://js.api.here.com/v3/3.1/mapsjs-service.js',
        'https://js.api.here.com/v3/3.1/mapsjs-ui.js',
        'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js'
      ];

      hereMapsLoaded = true;
      return Promise.all(
        scripts.map(
          (src) =>
            new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.onload = resolve;
              script.onerror = reject;
              document.body.appendChild(script);
            })
        )
      );
    };

    let platform;
    let defaultLayers;
    let handleResize;

    loadHereMaps()
      .then(() => {
        if (!mapContainerRef.current) return;
        platform = new window.H.service.Platform({
          apikey: process.env.REACT_APP_HERE_API_KEY
        });
        defaultLayers = platform.createDefaultLayers();

        if (!mapContainerRef.current) return;

        mapRef.current = new window.H.Map(mapContainerRef.current, defaultLayers.vector.normal.map, {
          center: { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) },
          zoom: 14,
          pixelRatio: window.devicePixelRatio || 1
        });

        handleResize = () => {
          try {
            mapRef.current?.getViewPort().resize();
          } catch (e) {}
        };
        window.addEventListener('resize', handleResize);

        try {
          new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(mapRef.current));
          window.H.ui.UI.createDefault(mapRef.current, defaultLayers);
        } catch (e) {
          console.warn('HERE UI init error (ignored):', e);
        }

        try {
          incidentMarkerRef.current = new window.H.map.Marker({
            lat: parseFloat(report.latitude),
            lng: parseFloat(report.longitude)
          });
          mapRef.current.addObject(incidentMarkerRef.current);
        } catch (e) {
          console.warn('Incident marker creation failed:', e);
        }

        try {
          const carIcon = new window.H.map.Icon('https://cdn-icons-png.flaticon.com/512/8023/8023798.png', {
            size: { w: 32, h: 32 }
          });
          responderMarkerRef.current = new window.H.map.Marker(
            responderLocationRef.current || { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) },
            { icon: carIcon }
          );
          mapRef.current.addObject(responderMarkerRef.current);
        } catch (e) {
          console.warn('Responder marker creation failed:', e);
        }

        try {
          mapRef.current.addEventListener('pointerdown', () => {
            followRef.current = false;
          });
        } catch (e) {}

        setMapReady(true);
        debug('HERE map initialized');
      })
      .catch((err) => {
        console.error('Failed to load HERE Maps scripts:', err);
      });

    return () => {
      try {
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      } catch (e) {}

      try {
        if (mapRef.current) {
          try {
            const objs = mapRef.current.getObjects ? mapRef.current.getObjects() : [];
            if (Array.isArray(objs) && objs.length) {
              try {
                mapRef.current.removeObjects(objs);
              } catch (ee) {}
            }
          } catch (e) {}
          try {
            mapRef.current.dispose();
          } catch (e) {}
          mapRef.current = null;
        }
      } catch (e) {
        console.warn('Error during map cleanup:', e);
      }

      window.removeEventListener('resize', handleResize);
      responderMarkerRef.current = null;
      incidentMarkerRef.current = null;
      routeLineRef.current = null;
      setMapReady(false);
    };

  }, [report]);

  useEffect(() => {
    if (!report?.id) return;
    if (!mapReady) return;

    if (!ablyPublishRef.current) {
      try {
        ablyPublishRef.current = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_PUBLISH_KEY });
        debug('Ably initialized');
      } catch (err) {
        console.error('Failed to init Ably publisher:', err);
      }
    }
    const locationChannel = ablyPublishRef.current?.channels.get('responder-location');

    const geoOptions = { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 };
    lastPublishedRef.current = 0;

    let fallbackTimer = null;

    const publishLocation = (loc) => {
      try {
        if (!locationChannel) return false;
        locationChannel.publish('update', {
          teamId: report.assignedTeam,
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracy,
          timestamp: new Date().toISOString()
        });
        lastPublishedRef.current = Date.now();
        lastSentRef.current = { lat: loc.lat, lng: loc.lng, acc: loc.accuracy, ts: Date.now() };
        debug(`published ${loc.lat.toFixed(6)},${loc.lng.toFixed(6)} acc:${Math.round(loc.accuracy)}m`);
        return true;
      } catch (err) {
        console.warn('Ably publish failed:', err);
        return false;
      }
    };

    const distanceMeters = (a, b) => {
      if (!a || !b) return Infinity;
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371000; // m
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const sinDlat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
      const sinDlon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon), Math.sqrt(1 - (sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon)));
      return R * c;
    };

    const updateRouteIfReady = async (loc) => {
      if (!loc || !mapRef.current || !window.H) return;
      try {
        const url =
          `https://router.hereapi.com/v8/routes?apikey=${process.env.REACT_APP_HERE_API_KEY}` +
          `&transportMode=car` +
          `&routingMode=short` +
          `&origin=${loc.lat},${loc.lng}` +
          `&destination=${report.latitude},${report.longitude}` +
          `&return=polyline,summary`;

        const res = await fetch(url);
        const data = await res.json();
        if (!mapRef.current) return;
        if (data.routes?.length) {
          const encodedPolyline = data.routes[0].sections[0].polyline;
          const lineString = window.H.geo.LineString.fromFlexiblePolyline(encodedPolyline);

          if (routeLineRef.current && mapRef.current) {
            try {
              mapRef.current.removeObject(routeLineRef.current);
            } catch (e) {}
            routeLineRef.current = null;
          }

          try {
            routeLineRef.current = new window.H.map.Polyline(lineString, { style: { strokeColor: 'blue', lineWidth: 4 } });
            mapRef.current.addObject(routeLineRef.current);
            try {
              mapRef.current.getViewModel().setLookAtData({ bounds: routeLineRef.current.getBoundingBox() });
            } catch (e) {
              try {
                mapRef.current.setCenter({ lat: loc.lat, lng: loc.lng });
              } catch (ee) {}
            }
          } catch (e) {
            console.warn('Failed to add route polyline:', e);
          }
        }
      } catch (err) {
        console.error('Routing error (safe):', err);
        debug('Routing error: ' + (err.message || err));
      }
    };

    const success = (position) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setResponderLocation(newLocation);
      responderLocationRef.current = newLocation;
      debug(`loc ${newLocation.lat.toFixed(6)},${newLocation.lng.toFixed(6)} acc:${Math.round(newLocation.accuracy)}m`);

      try {
        responderMarkerRef.current?.setGeometry({ lat: newLocation.lat, lng: newLocation.lng });
      } catch (e) {}

      if (followRef.current && mapRef.current) {
        try {
          mapRef.current.setCenter({ lat: newLocation.lat, lng: newLocation.lng });
        } catch (e) {}
      }

      try {
        if (newLocation.accuracy <= 80 && window.H && report?.latitude && report?.longitude) {
          const distance = window.H.geo.Distance.measure(
            { lat: parseFloat(newLocation.lat), lng: parseFloat(newLocation.lng) },
            { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) }
          );
          if (distance <= 50 && report.status !== 'On Scene' && !arrived) {
            (async () => {
              try {
                await apiFetch(`${process.env.REACT_APP_URL}/api/responder/report/${report.id}/update-status`, {
                  method: 'POST',
                  body: JSON.stringify({ status: 'On Scene' })
                });
                debug('Marked On Scene');
                setArrived(true);
                setStatus('On Scene');
                setReport((prev) => ({ ...prev, status: 'On Scene' }));
              } catch (err) {
                console.error('Failed to update On Scene:', err);
              }
            })();
          }
        }
      } catch (e) {
        console.error('Arrival check error:', e);
      }

      const now = Date.now();
      const last = lastSentRef.current;
      let shouldPublish = false;

      if (!last) {
        shouldPublish = true;
      } else {
        const moved = distanceMeters(last, newLocation);
        if (moved > 3) shouldPublish = true;
        if (Math.abs((last.acc || 0) - newLocation.accuracy) > 10) shouldPublish = true;
        if (now - lastPublishedRef.current >= 3000) shouldPublish = true;
      }

      if (shouldPublish) {
        publishLocation(newLocation);
      }

      updateRouteIfReady(newLocation);

      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const error = (err) => {
      console.error('Geolocation error (central):', err);
      if (err && err.code !== 1) {
        debug('Geolocation error: ' + (err.message || err.code));
        alert('Unable to get location reliably. Move near a window or go outdoors for better GPS signal.');
      }
    };

    const stopWatcher = () => {
      try {
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          debug('Geolocation watcher stopped');
        }
      } catch (e) {
        console.warn(e);
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const startWatcher = () => {
      stopWatcher();

      if (!navigator.geolocation) {
        debug('Geolocation not supported by browser');
        return;
      }

      const tryStart = () => {
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(success, error, geoOptions);
          debug('Geolocation watcher started (via watchPosition)');

          fallbackTimer = setTimeout(() => {
            if (!responderLocationRef.current) {
              try {
                navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 8000 });
                debug('Fallback getCurrentPosition triggered');
              } catch (e) {
                console.warn(e);
              }
            } else {
              const stale = responderLocationRef.current;
              if (!lastSentRef.current || Date.now() - lastPublishedRef.current > 5000) {
                publishLocation(stale);
                debug('Forced publish of existing location after restart');
              }
            }
          }, 6000);
        } catch (e) {
          console.error('watchPosition failed to start:', e);
        }
      };

      if (navigator.permissions && navigator.permissions.query) {
        try {
          navigator.permissions
            .query({ name: 'geolocation' })
            .then((ps) => {
              debug('geo permission state: ' + ps.state);
              if (ps.state === 'denied') {
                alert('Location access is blocked. Please enable location permissions for this site in your browser settings.');
                return;
              }
              tryStart();
            })
            .catch(() => {
              tryStart();
            });
        } catch (e) {
          tryStart();
        }
      } else {
        tryStart();
      }
    };

    restartWatcherRef.current = () => {
      debug('Manual restart requested');
      startWatcher();
    };

    startWatcher();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        debug('Document visible -> restarting watcher');
        startWatcher();
      } else {
        debug('Document hidden -> stopping watcher (allowing browser to manage power)');
        stopWatcher();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      try {
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      } catch (e) {}
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      try {
        locationChannel?.detach();
      } catch (e) {}
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [report?.id, mapReady]);

  useEffect(() => {
    return () => {
      try {
        if (ablyPublishRef.current) {
          ablyPublishRef.current.close();
          ablyPublishRef.current = null;
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    const handleIncidentUpdated = (e) => {
      const data = e.detail;
      if (data.id === report?.id) {
        debug('Incident update received via Echo');
        setReport((prev) => ({
          ...prev,
          description: data.description,
          landmark: data.landmark,
          status: data.status
        }));
        setStatus(data.status);
      }
    };
    window.addEventListener('incidentDetailsUpdated', handleIncidentUpdated);
    return () => window.removeEventListener('incidentDetailsUpdated', handleIncidentUpdated);
  }, [report?.id]);

  const parseResponse = async (res) => {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    } else {
      const text = await res.text();
      return { __rawText: text };
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const statusToSend = status === 'assigned' ? 'En Route' : status;
      const token = localStorage.getItem('token');

      const res = await fetch(`${process.env.REACT_APP_URL}/api/responder/report/${id}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusToSend })
      });

      const data = await parseResponse(res);
      if (!res.ok) {
        console.error('Update status failed', res.status, data);
        if (res.status === 401) {
          alert('Session expired. Please login again.');
        } else {
          alert(data.message || data.__rawText || 'Failed to update status');
        }
        return;
      }

      const newStatus = data.status || statusToSend;
      setReport((prev) => ({ ...prev, status: newStatus }));
      setStatus(newStatus);
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Failed to update status (network or parse error):', err);
      alert('Failed to update status (network error)');
    }
  };

  const handleRequestBackup = async () => {
    setShowRequestSent(false);
    try {
      const token = localStorage.getItem('token');

      let bpType = backupType;
      if (backupType === 'Medical Service') bpType = 'medic';
      else if (backupType === 'LGU') bpType = 'lgu';

      const res = await fetch(`${process.env.REACT_APP_URL}/api/responder/report/${id}/request-backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ backup_type: bpType, reason: backupReason })
      });

      const data = await parseResponse(res);
      if (!res.ok) {
        console.error('Request backup failed', res.status, data);
        if (res.status === 401) {
          alert('Session expired. Please login again.');
        } else {
          alert(data.message || data.__rawText || 'Failed to request backup');
        }
        return;
      }

      setShowBackupModal(false);
      setShowRequestSent(true);
      setStatus('Requesting Backup');
      setReport((prev) => ({ ...prev, status: 'Requesting Backup' }));
    } catch (err) {
      console.error('Failed to request backup (network or parse error):', err);
      alert('Failed to send backup request (network error)');
    }
  };

  return (
    <div className="responder-view-report">
      <ResponderHeader />

      <div className="r-title-container">
        <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)}/>
        <h1>Report Details</h1>
      </div>

      <div className="responder-view-report">
        <div className="map-section">
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '800px',
              borderRadius: '8px',
              marginTop: '70px',
              position: 'relative',
              zIndex: 0,
              filter: shareLocation ? 'none' : 'blur(8px)',
              transition: 'filter 0.3s ease'
            }}
          />
          {!shareLocation && (
            <div className="map-blur-overlay">
              <p>Location Sharing Off</p>
            </div>
          )}
        </div>

        <div className="details-card">
          <div className="details-row top-row">
            <p className="r-report-datetime">{report?.dateTime || ''}</p>
            <div className="toggle-wrap">
              <label className="switch">
                <input type="checkbox" checked={shareLocation} onChange={(e) => setShareLocation(e.target.checked)} />
                <span className="slider" />
              </label>
              <span className="toggle-label">Location</span>
            </div>
          </div>

          <div className="details-placeholder" aria-hidden="true" />

          <div className="details-body">
            <p className="r-report-location">{resolvedAddress}</p>
            {report?.landmark && <p className="report-landmark">Landmark: {report.landmark}</p>}
            <p className="r-report-name">{report?.reporterName || ''}</p>
            <p className="r-report-incident">
              Incident Type : <span className="incident-type">{report?.type || ''}</span>
            </p>
            {report?.description && (
              <p className="r-report-incident">
                Description: <span className="report-description">{report.description}</span>
              </p>
            )}

            <p className="r-report-accuracy">
              GPS: {responderLocation ? `${responderLocation.lat.toFixed(6)}, ${responderLocation.lng.toFixed(6)}` : '—'}{' '}
              {responderLocation?.accuracy ? ` (±${Math.round(responderLocation.accuracy)} m)` : ''}
            </p>
            <p className="r-report-timestamp">
              Last seen: {responderLocation?.timestamp ? new Date(responderLocation.timestamp).toLocaleTimeString() : '-'}
            </p>
          </div>

          <div className="form-group">
            <label className="field-label">Current Report Status:</label>
            <div className="select-wrap">
              <select className="status-select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={status === 'Resolved'}>
                <option value="En Route">En Route</option>
                <option value="On Scene">On Scene</option>
                <option value="Resolved">Resolved</option>
              </select>
              <span className="chevron">▾</span>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-backup" onClick={() => setShowBackupModal(true)}>
              Request Backup
            </button>
            <button className="btn btn-primary" onClick={handleUpdateStatus}>
              Update Status
            </button>
          </div>
        </div>

        {showBackupModal && (
          <div className="modal-backdrop" onClick={() => setShowBackupModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Backup Request</h3>
              <div className="modal-content">
                <label className="modal-label">Select Backup Type</label>
                <div className="modal-select-wrap">
                  <select
                    className="modal-select"
                    value={backupType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setBackupType(type);
                      if (type === 'Medical Service') setBackupReason('medical');
                      else if (type === 'LGU') setBackupReason('escalation');
                    }}
                  >
                    <option value="" hidden>
                      Select
                    </option>
                    <option value="Medical Service">Emergency Medical Service</option>
                    <option value="LGU">LGU</option>
                  </select>
                  <span className="modal-chevron">▾</span>
                </div>

                <label className="modal-label">Reason for Backup:</label>
                <div className="modal-select-wrap">
                  <select className="modal-select" value={backupReason} onChange={(e) => setBackupReason(e.target.value)}>
                    <option value="overwhelmed">Insufficient manpower</option>
                    <option value="injury">Responder injury or fatigue</option>
                    <option value="escalation">Large-scale incident</option>
                    <option value="medical">Medical assistance required</option>
                  </select>
                  <span className="modal-chevron">▾</span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="modal-request-btn" onClick={handleRequestBackup}>
                  Request
                </button>
              </div>
            </div>
          </div>
        )}

        {showRequestSent && (
          <div className="modal-backdrop" onClick={() => setShowRequestSent(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="success-icon" aria-hidden="true" />
              {backupType === 'Medical Service' || backupType === 'medic' ? (
                <p className="success-text">
                  The <strong>Medical Team</strong> has been automatically assigned to this incident. <br />
                  They are now preparing to assist your team.
                </p>
              ) : (
                <p className="success-text">
                  Your request has been sent. <br />
                  Please wait for backup.
                </p>
              )}
              <div className="modal-actions">
                <button className="modal-request-btn" onClick={() => setShowRequestSent(false)}>
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        <ResponderBottomNav />
        {/*
        <div
          style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            width: 260,
            maxHeight: 220,
            overflow: 'auto',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: 8,
            fontSize: 11,
            borderRadius: 8,
            zIndex: 9999
          }}
        >
          <strong>Debug</strong>
          <div style={{ fontSize: 11, marginTop: 6 }}>
            <div>Map ready: {mapReady ? 'yes' : 'no'}</div>
            <div>Report: {report?.id ?? '—'}</div>
            <div>Last coord: {responderLocation ? `${responderLocation.lat.toFixed(6)},${responderLocation.lng.toFixed(6)}` : '—'}</div>
            <div>Acc: {responderLocation?.accuracy ? `${Math.round(responderLocation.accuracy)} m` : '-'}</div>
            <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <pre style={{ whiteSpace: 'pre-wrap' }}>{debugLines.slice(-6).join('\n')}</pre>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => {
                  debug('Manual restart clicked');
                  restartWatcherRef.current?.();
                }}
                style={{ fontSize: 11, padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
              >
                Restart location
              </button>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default ResponderViewReport;
