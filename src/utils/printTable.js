export function printTable(data, columns, title) {
  const currentDateTime = new Date().toLocaleString();

  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header-left {
            display: flex;
            align-items: center;
          }
          .header-left img {
            height: 50px;
            margin-right: 15px;
          }
          h1 {
            font-size: 20px;
            margin: 0;
          }
          .subtitle {
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .footer {
            margin-top: 40px;
            font-size: 10px;
            display: flex;
            justify-content: space-between;
          }
          .signatures {
            margin-top: 60px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
          }
          .print-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          }
          .print-btn:hover {
            background-color: #0056b3;
          }
          @media print {
            .print-btn {
              display: none;
            }
            @page {
              size: A4;
              margin: 5mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="YOUR_LOGO_URL_HERE" alt="ResBac Logo" />
            <div>
              <h1>ResBac – Municipal Emergency Assistance & Incident Response</h1>
              <div class="subtitle">${title}</div>
              <div class="subtitle">Generated: ${currentDateTime}</div>
            </div>
          </div>
          <div>
            <button class="print-btn" onclick="window.print()">🖨 Print</button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div>Prepared By: ___________________</div>
          <div>Approved By: ___________________</div>
        </div>

        <div class="footer">
          <div>For internal use only. Do not distribute without authorization.</div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}
