'use client';

import React, { useEffect, useState } from 'react';

interface StimulsoftViewerProps {
    reportName: string;
    data: any;
}

export default function StimulsoftViewer({ reportName, data }: StimulsoftViewerProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(timer);
    }, [reportName, data]);

    const licenseKey = '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkCHOndDMGcaz4hq3BqQ8ZAG9tkrDjUtDcD7ZE6KFqmx8dAWd' +
          'kdcXnPKxraZiw+UTvTEyvXeViQmIkepCw+OxFDSlI7FfqE8giSZjTv8SXY4Zsl4hxBr3tQJrn4BDvR7f6irJdta9Sc' +
          'd+oSTR4bzZ0vber87GdVhJlUsyI6ZMYsXpQ8ZyGEDquwoP+MyLOsunpBgortlUfiQQ0eCBlWKmvYnuuApPa6+E2BPH' +
          'FrJ59zjgQH8Io7bvvRVTdLFCpV8n1iwdR8anxYut/RwhvM504chrOdbppBI90KIXRtCi/K+vvhwicoRLerYpNttZME' +
          '0CYQMX8v2tinIh7+S75vTrxV7PZLPCPE4+mtKtV+wvgopakQrFR9FJ107CqVIRguopAdGJ5qL4hPLC5G3sC9kz0muY' +
          'X1yOxeWDE6y3VoGCQL/zCsaZZqHdoRSNVrWhlymVRo0OFqTK/dgyAm2Lr/NXwS0LvEiwf+hiNmWh/SrCt+Zl6ZttuP' +
          '3sJhl28e3eWZ5lTLF6FWM5HTETVpegOmQtMi';

    const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Stimulsoft Viewer Isolation</title>
            <script src="https://unpkg.com/stimulsoft-reports-js@2025.1.6/Scripts/stimulsoft.reports.js"></script>
            <script src="https://unpkg.com/stimulsoft-reports-js@2025.1.6/Scripts/stimulsoft.dashboards.js"></script>
            <script src="https://unpkg.com/stimulsoft-reports-js@2025.1.6/Scripts/stimulsoft.viewer.js"></script>
            <style>
                html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: white; }
                #viewer { height: 100% !important; width: 100% !important; }
            </style>
        </head>
        <body>
            <div id="viewer"></div>
            <script>
                try {
                    Stimulsoft.Base.StiLicense.Key = "${licenseKey}";
                    
                    const report = new Stimulsoft.Report.StiReport();
                    report.loadFile("/reports/${reportName}.mrt");

                    // Prepare data: wrap in object to ensure Stimulsoft creates a valid table
                    const reportData = ${JSON.stringify(data)};
                    const wrappedData = { "Data": reportData, "root": reportData };
                    
                    console.log("Loading data into report:", wrappedData);

                    const dataSet = new Stimulsoft.System.Data.DataSet("root");
                    dataSet.readJson(wrappedData);
                    
                    // Register under multiple names to match common MRT configurations
                    report.regData("root", "root", dataSet);
                    report.regData("Data", "Data", dataSet);
                    
                    report.dictionary.synchronize();

                    const options = new Stimulsoft.Viewer.StiViewerOptions();
                    options.appearance.fullScreenMode = false;
                    options.appearance.scrollbarsMode = true;
                    options.appearance.theme = Stimulsoft.Viewer.StiViewerTheme.Office2013WhiteBlue;
                    
                    const viewer = new Stimulsoft.Viewer.StiViewer(options, "viewer", false);
                    viewer.report = report;
                    viewer.renderHtml("viewer");
                } catch (e) {
                    console.error("Viewer Error:", e);
                }
            </script>
        </body>
        </html>
    `;

    return (
        <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden shadow-inner" style={{ minHeight: '600px', height: '800px' }}>
            {!isLoaded ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Laporan...</p>
                </div>
            ) : (
                <iframe 
                    key={reportName + JSON.stringify(data).length + Date.now()}
                    title="Stimulsoft Viewer"
                    srcDoc={iframeContent}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                />
            )}
        </div>
    );
}
