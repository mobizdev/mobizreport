'use client';

import React, { useEffect, useState } from 'react';

export default function StimulsoftDesigner() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // We use a small delay to ensure the component is mounted
        const timer = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // License key to be passed to the iframe
    const licenseKey = '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkCHOndDMGcaz4hq3BqQ8ZAG9tkrDjUtDcD7ZE6KFqmx8dAWd' +
          'kdcXnPKxraZiw+UTvTEyvXeViQmIkepCw+OxFDSlI7FfqE8giSZjTv8SXY4Zsl4hxBr3tQJrn4BDvR7f6irJdta9Sc' +
          'd+oSTR4bzZ0vber87GdVhJlUsyI6ZMYsXpQ8ZyGEDquwoP+MyLOsunpBgortlUfiQQ0eCBlWKmvYnuuApPa6+E2BPH' +
          'FrJ59zjgQH8Io7bvvRVTdLFCpV8n1iwdR8anxYut/RwhvM504chrOdbppBI90KIXRtCi/K+vvhwicoRLerYpNttZME' +
          '0CYQMX8v2tinIh7+S75vTrxV7PZLPCPE4+mtKtV+wvgopakQrFR9FJ107CqVIRguopAdGJ5qL4hPLC5G3sC9kz0muY' +
          'X1yOxeWDE6y3VoGCQL/zCsaZZqHdoRSNVrWhlymVRo0OFqTK/dgyAm2Lr/NXwS0LvEiwf+hiNmWh/SrCt+Zl6ZttuP' +
          '3sJhl28e3eWZ5lTLF6FWM5HTETVpegOmQtMi';

    // The iframe content needs to load the scripts and initialize the designer
    // We use the UNPKG versions since they were confirmed working without SyntaxError
    const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Stimulsoft Designer Isolation</title>
            <script src="https://unpkg.com/stimulsoft-reports-js@2025.1.6/Scripts/stimulsoft.reports.js"></script>
            <script src="https://unpkg.com/stimulsoft-reports-js@2025.1.6/Scripts/stimulsoft.dashboards.js"></script>
            <script src="https://unpkg.com/stimulsoft-reports-js@2025.1.6/Scripts/stimulsoft.viewer.js"></script>
            <script src="https://unpkg.com/stimulsoft-reports-js@2025.1.6/Scripts/stimulsoft.designer.js"></script>
            <style>
                html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: white; }
                #designer { height: 100% !important; width: 100% !important; }
            </style>
        </head>
        <body>
            <div id="designer"></div>
            <script>
                Stimulsoft.Base.StiLicense.Key = "${licenseKey}";
                
                const options = new Stimulsoft.Designer.StiDesignerOptions();
                options.appearance.fullScreenMode = true; 
                options.appearance.showFileMenu = true;
                options.appearance.showSaveButton = true;
                
                const designer = new Stimulsoft.Designer.StiDesigner(options, 'designer', false);
                
                // Handler untuk tombol Save
                designer.onSaveReport = (event) => {
                    const jsonString = event.report.saveToJsonString();
                    const blob = new Blob([jsonString], { type: 'text/plain' });
                    const anchor = document.createElement('a');
                    anchor.download = "LaporanBaru.mrt";
                    anchor.href = window.URL.createObjectURL(blob);
                    anchor.click();
                };

                designer.report = new Stimulsoft.Report.StiReport();
                designer.renderHtml('designer');
            </script>
        </body>
        </html>
    `;

    return (
        <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xl" style={{ height: 'calc(100vh - 160px)' }}>
            {!isLoaded ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Isolasi Lingkungan Kerja...</p>
                </div>
            ) : (
                <iframe 
                    title="Stimulsoft Designer"
                    srcDoc={iframeContent}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
                />
            )}
        </div>
    );
}
