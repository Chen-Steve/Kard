import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const PrivacyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('privacy');
  const [privacyPolicy, setPrivacyPolicy] = useState<{ title: string; sections: { header: string | null; paragraphs: string[] }[] } | null>(null);
  const [cookiesPolicy, setCookiesPolicy] = useState<{ title: string; sections: { header: string | null; paragraphs?: string[]; table?: { headers: string[]; rows: string[][] } }[] } | null>(null);
  const [termsOfService, setTermsOfService] = useState<{ title: string; content: string }[]>([]);
  const [copyrightPolicy, setCopyrightPolicy] = useState<{ title: string; sections: { header: string | null; paragraphs: string[] }[] } | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch('/json/cookiesNmore.json');
        const data = await response.json();
        setPrivacyPolicy(data.privacy);
        setCookiesPolicy(data.cookies);
        setTermsOfService(data.terms);
        setCopyrightPolicy(data.copyright);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };

    fetchPolicies();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">{privacyPolicy?.title}</h1>
            {privacyPolicy?.sections.map((section, index) => (
              <div key={index}>
                {section.header && <h2 className="text-2xl font-bold mb-4">{section.header}</h2>}
                {section.paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-muted-foreground mb-6">{paragraph}</p>
                ))}
              </div>
            ))}
          </>
        );
      case 'cookies':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">{cookiesPolicy?.title}</h1>
            {cookiesPolicy?.sections.map((section, index) => (
              <div key={index}>
                {section.header && <h2 className="text-2xl font-bold mb-4">{section.header}</h2>}
                {section.paragraphs && section.paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-muted-foreground mb-6">{paragraph}</p>
                ))}
                {section.table && (
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          {section.table.headers.map((header, idx) => (
                            <th key={idx} className="px-4 py-2 text-left border-b">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-2 border-r">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </>
        );
      case 'terms':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            {termsOfService.map((section, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                <p className="text-muted-foreground mb-6">{section.content}</p>
              </div>
            ))}
          </>
        );
      case 'copyright':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">{copyrightPolicy?.title}</h1>
            {copyrightPolicy?.sections.map((section, index) => (
              <div key={index}>
                {section.header && <h2 className="text-2xl font-bold mb-4">{section.header}</h2>}
                {section.paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-muted-foreground mb-6">{paragraph}</p>
                ))}
              </div>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <FaArrowLeft className="cursor-pointer" onClick={() => window.history.back()} />
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded ${activeTab === 'privacy' ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-300`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-4 py-2 rounded ${activeTab === 'cookies' ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-300`}
          >
            Cookies
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded ${activeTab === 'terms' ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-300`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('copyright')}
            className={`px-4 py-2 rounded ${activeTab === 'copyright' ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-300`}
          >
            Copyright
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default PrivacyPage;