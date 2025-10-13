import React from 'react';

/**
 * Disclaimer component - Important information about data usage
 * Displays OpenAQ attribution and usage limitations
 */
function Disclaimer() {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">
              Important Disclaimer
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
              <p>
                <strong>Data Source:</strong> Air quality data is provided by{' '}
                <a
                  href="https://openaq.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-900 dark:hover:text-yellow-200"
                >
                  OpenAQ
                </a>
                , an open-source platform aggregating data from government monitoring stations worldwide.
              </p>
              <p>
                <strong>Not for Emergency Use:</strong> This application is for informational and educational purposes only. 
                Do not use this data for emergency decisions or health-critical situations.
              </p>
              <p>
                <strong>Data Accuracy:</strong> Air quality can vary significantly by location and time. 
                Measurements are subject to sensor accuracy, calibration, and environmental conditions.
              </p>
              <p>
                <strong>Health Guidance:</strong> For official health recommendations, consult your local 
                environmental protection agency or healthcare provider.
              </p>
              <p className="text-xs pt-2 border-t border-yellow-300 dark:border-yellow-700">
                AQI calculations follow the EPA NowCast formula. Last updated: {new Date().toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disclaimer;
