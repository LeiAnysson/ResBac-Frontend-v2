/* global H */
import React, { useEffect, useRef } from "react";

export default function BocaueHeatmap({
    apiKey,
    incidents = [],
    geoJsonUrl = null,
    mapOptions = {},
    cacheTTL = 1000 * 60 * 60 * 24
}) {
    const mapRef = useRef(null);
    const platformRef = useRef(null);
    const uiRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layerRef = useRef(null);
    const geoJsonLayerRef = useRef(null);

    const MUNICIPAL = { lat: 14.79407719563481, lng: 120.94294770863102 };

    function colorForCount(count, maxCount) {
        const p = maxCount > 0 ? Math.min(count / maxCount, 1) : 0;

        const mutedColors = {
            green: { r: 120, g: 200, b: 120 }, 
            yellow: { r: 255, g: 210, b: 120 }, 
            red: { r: 201, g: 76, b: 76 }  
        };

        if (p <= 0.5) {
            const t = p / 0.5;
            const r = Math.round(mutedColors.green.r + (mutedColors.yellow.r - mutedColors.green.r) * t);
            const g = Math.round(mutedColors.green.g + (mutedColors.yellow.g - mutedColors.green.g) * t);
            const b = Math.round(mutedColors.green.b + (mutedColors.yellow.b - mutedColors.green.b) * t);
            return `rgb(${r},${g},${b})`;
        } else {
            const t = (p - 0.5) / 0.5;
            const r = Math.round(mutedColors.yellow.r + (mutedColors.red.r - mutedColors.yellow.r) * t);
            const g = Math.round(mutedColors.yellow.g + (mutedColors.red.g - mutedColors.yellow.g) * t);
            const b = Math.round(mutedColors.yellow.b + (mutedColors.red.b - mutedColors.yellow.b) * t);
            return `rgb(${r},${g},${b})`;
        }
    }

    async function loadHereScripts() {
        if (window.H && window.H.map) return Promise.resolve();
        const base = "https://js.api.here.com/v3/3.1";
        const urls = [
        `${base}/mapsjs-core.js`,
        `${base}/mapsjs-service.js`,
        `${base}/mapsjs-ui.js`,
        `${base}/mapsjs-mapevents.js`,
        `${base}/mapsjs-clustering.js`,
        `${base}/mapsjs-data.js`
        ];
        return Promise.all(
        urls.map(
            src =>
            new Promise((resolve, reject) => {
                if (document.querySelector(`script[src='${src}']`)) return resolve();
                const s = document.createElement("script");
                s.src = src;
                s.async = true;
                s.onload = () => resolve();
                s.onerror = reject;
                document.head.appendChild(s);
            })
        )
        );
    }

    function drawMarkers(map, incidentsArray) {
        if (!window.H || !map) return;

        if (layerRef.current) {
        try {
            if (layerRef.current instanceof window.H.map.layer.Layer) map.removeLayer(layerRef.current);
            else if (layerRef.current instanceof window.H.map.Group) map.removeObject(layerRef.current);
        } catch (e) {

        }
        layerRef.current = null;
        }

        //console.log("Drawing markers for incidents:", incidentsArray);

        const maxCount = incidentsArray.reduce((m, i) => Math.max(m, i.count || 0), 0);
        const group = new window.H.map.Group();

        incidentsArray.forEach(i => {
        if (!i.lat || !i.lng) {
            console.warn("Skipping incident without coords:", i);
            return;
        }
        const color = colorForCount(i.count || 0, maxCount);
        const size = 18;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.4}" viewBox="0 0 24 34">
        <path d="M12 0C5.4 0 0 5.2 0 11.6c0 7.9 10.6 20.7 11.1 21.3a1 1 0 0 0 1.7 0C13.4 32.3 24 19.5 24 11.6 24 5.2 18.6 0 12 0z" fill="${color}" stroke="#222" stroke-width="1"/>
        <circle cx="12" cy="11" r="4" fill="#fff" stroke="#222" stroke-width="1"/>
        </svg>`;

        const icon = new window.H.map.Icon(svg);
        const marker = new window.H.map.Marker({ lat: i.lat, lng: i.lng }, { icon });
        marker.setData({ barangay: i.barangay, count: i.count });
        //console.log("Adding marker:", i.barangay, i.lat, i.lng);
        group.addObject(marker);
        });

        group.forEach(marker => {
            marker.addEventListener("tap", evt => {
                const d = marker.getData();
                if (!d) return;
                uiRef.current.getBubbles().forEach(b => b.close());
                const bubble = new window.H.ui.InfoBubble(marker.getGeometry(), {
                content: `<div style="font-size:12px; line-height:1.2;">
                            <b>${d.barangay}</b><br/>
                            Incidents: ${d.count || 0}
                            </div>`,
                maxWidth: 150
                });
                uiRef.current.addBubble(bubble);
            });
        });

        map.addObject(group);
        layerRef.current = group;
    }

    function fitMapToPoints(map, points = []) {
        if (!window.H || !map || points.length === 0) return;
        const lats = points.map(p => p.lat);
        const lngs = points.map(p => p.lng);
        const top = Math.max(...lats);
        const bottom = Math.min(...lats);
        const left = Math.min(...lngs);
        const right = Math.max(...lngs);

        const latSpan = top - bottom || 0.01;
        const lngSpan = right - left || 0.01;
        const padFactor = 0.15;
        const paddedTop = top + latSpan * padFactor;
        const paddedBottom = bottom - latSpan * padFactor;
        const paddedLeft = left - lngSpan * padFactor;
        const paddedRight = right + lngSpan * padFactor;

        const bounds = new window.H.geo.Rect(paddedTop, paddedLeft, paddedBottom, paddedRight);
        map.getViewModel().setLookAtData({ bounds });
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
        if (!apiKey) {
            console.error("HERE apiKey required");
            return;
        }
        try {
            await loadHereScripts();
        } catch (e) {
            console.error("Failed to load HERE scripts", e);
            return;
        }
        if (!mounted) return;

        if (!mapRef.current) {
            console.error("mapRef not present");
            return;
        }

        if (mapInstanceRef.current) {
            console.log("Map already initialized — skipping re-init");
            return;
        }

        platformRef.current = new window.H.service.Platform({ apikey: apiKey });
        const defaultLayers = platformRef.current.createDefaultLayers();

        const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
            center: mapOptions.center || MUNICIPAL,
            zoom: mapOptions.zoom || 12,
            pixelRatio: window.devicePixelRatio || 1
        });
        mapInstanceRef.current = map;

        new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
        uiRef.current = window.H.ui.UI.createDefault(map, defaultLayers);

        if (geoJsonUrl) {
            try {
            const res = await fetch(geoJsonUrl);
            if (res.ok) {
                const geo = await res.json();
                const reader = new window.H.data.geojson.Reader(geo);
                reader.parse();
                geoJsonLayerRef.current = reader.getLayer();
                map.addLayer(geoJsonLayerRef.current);
            } else {
                console.warn("Failed to fetch geoJsonUrl:", geoJsonUrl);
            }
            } catch (e) {
            console.warn("Could not draw GeoJSON", e);
            }
        }

        //console.log("Map initialized");

        const onResize = () => map.getViewPort().resize();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            try {
            map.dispose();
            platformRef.current = null;
            uiRef.current = null;
            mapInstanceRef.current = null;
            console.log("Map disposed");
            } catch (e) {}
        };
        })();

        return () => {
        mounted = false;
        };
    }, [apiKey]); 

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !window.H) {
        //console.log("Map not ready yet — will draw markers when ready");
        return;
        }

        drawMarkers(map, incidents || []);

        const allPoints = (incidents || []).filter(i => i.lat && i.lng).map(i => ({ lat: i.lat, lng: i.lng }));

        if (allPoints.length) fitMapToPoints(map, allPoints);

        map.getViewPort().resize();

    }, [incidents, geoJsonUrl]);

    return (
        <div style={{ width: "100%", height: "100%", minHeight: 320, position: "relative" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
