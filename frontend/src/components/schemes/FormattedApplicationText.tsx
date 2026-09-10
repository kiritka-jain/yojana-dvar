import React, { useState } from 'react';
import { 
  FileDown, 
  ExternalLink, 
  Mail, 
  Copy, 
  Check, 
  CheckCircle2, 
  Globe
} from 'lucide-react';
import { parseApplicationSteps, type ProcessStep } from '../../utils/applicationProcessParser';
import { useLanguage } from '../../context/LanguageContext';

interface FormattedApplicationTextProps {
  text: string;
  language?: 'en' | 'hi';
  applyUrl?: string;
  officialUrl?: string;
}

export const FormattedApplicationText: React.FC<FormattedApplicationTextProps> = ({
  text,
  language = 'en',
  applyUrl,
  officialUrl
}) => {
  const { t } = useLanguage();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!text || !text.trim()) {
    return (
      <div className="p-4 rounded-xl bg-cream-100/60 border border-cream-200 text-xs text-charcoal-600">
        <p>
          {language === 'hi' 
            ? 'आवेदन करने के लिए संबंधित विभाग के आधिकारिक पोर्टल पर जाएं अथवा नजदीकी जन सेवा केंद्र (CSC) से संपर्क करें।' 
            : 'Visit the official nodal department website or your nearest Common Service Centre to apply.'}
        </p>
        {(applyUrl || officialUrl) && (
          <div className="mt-3 flex items-center gap-2">
            <a
              href={applyUrl || officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-saffron-500 hover:bg-saffron-600 text-white font-semibold text-xs transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('detailOpenOfficialPortal')}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  const steps: ProcessStep[] = parseApplicationSteps(text, language);

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          return (
            <div
              key={idx}
              className="relative p-4 sm:p-5 rounded-2xl bg-white/90 border border-cream-200 shadow-2xs hover:border-saffron-300 transition-all group"
            >
              {/* Step Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-saffron-500 text-white font-bold text-xs shadow-2xs">
                    {step.stepNumberLabel}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-charcoal-900 tracking-tight">
                    {step.stepBadge}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-charcoal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('detailStepHelp')}</span>
                </span>
              </div>

              {/* Step Content Text */}
              <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-normal">
                {step.content}
              </p>

              {/* Step Links & Action Chips */}
              {step.links && step.links.length > 0 && (
                <div className="mt-3 pt-3 border-t border-cream-200/70 flex flex-wrap items-center gap-2">
                  {step.links.map((link, linkIdx) => {
                    const isCopied = copiedUrl === link.url;
                    const isMail = link.url.startsWith('mailto:');

                    return (
                      <div
                        key={linkIdx}
                        className="inline-flex items-center rounded-xl overflow-hidden shadow-2xs border border-cream-200 text-xs transition-all hover:scale-102"
                      >
                        <a
                          href={link.url}
                          target={isMail ? undefined : '_blank'}
                          rel={isMail ? undefined : 'noopener noreferrer'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[11px] sm:text-xs transition-colors ${
                            link.isPdf
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-r border-rose-200'
                              : isMail
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-r border-blue-200'
                              : 'bg-saffron-50 hover:bg-saffron-100 text-saffron-900 border-r border-saffron-200'
                          }`}
                          title={link.url}
                        >
                          {link.isPdf ? (
                            <FileDown className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                          ) : isMail ? (
                            <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                          )}
                          <span className="font-medium truncate max-w-[200px] sm:max-w-[280px]">
                            {link.isPdf
                              ? t('detailOfficialPdfNotice')
                              : isMail
                              ? link.label
                              : link.domain}
                          </span>
                        </a>

                        {!isMail && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(link.url, e)}
                            className="px-2 py-1.5 bg-cream-100 hover:bg-cream-200 text-charcoal-600 transition-colors"
                            title={isCopied ? t('detailLinkCopied') : t('detailCopyLink')}
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-charcoal-400 hover:text-charcoal-700" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormattedApplicationText;
