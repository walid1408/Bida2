import React, { useState } from 'react';
import { X, Send, HelpCircle, CheckCircle2, MessageSquare, AlertCircle, Phone, Mail, FileText, LifeBuoy, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

export type ContactRequestType = 'complaint' | 'technical' | 'account' | 'inquiry' | 'suggestion' | 'other';

export interface ContactTicket {
  id: string;
  type: ContactRequestType;
  typeName: string;
  senderName: string;
  contactInfo: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'processing';
}

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userName?: string;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose,
  language,
  userName = ''
}) => {
  const [requestType, setRequestType] = useState<ContactRequestType>('complaint');
  const [senderName, setSenderName] = useState(userName || '');
  const [contactInfo, setContactInfo] = useState('');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<ContactTicket | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const typeOptions: { key: ContactRequestType; labelAr: string; labelFr: string; descAr: string; descFr: string }[] = [
    {
      key: 'complaint',
      labelAr: 'شكوى / بلاغ رسمـي',
      labelFr: 'Réclamation / Plainte',
      descAr: 'الإبلاغ عن سلوك غير لائق أو انتهاك للشروط',
      descFr: 'Signaler un comportement inapproprié ou un abus'
    },
    {
      key: 'technical',
      labelAr: 'مشكلة تقنية في التطبيق',
      labelFr: 'Problème Technique',
      descAr: 'خلل في الرسائل، الصور، أو خطأ في الصفحات',
      descFr: 'Bogue, problème d\'affichage ou d\'envoi'
    },
    {
      key: 'account',
      labelAr: 'مساعدة في الحساب والأمان',
      labelFr: 'Assistance Compte & Sécurité',
      descAr: 'تغيير كلمة السر، توثيق الحساب، أو استرجاع بيانات',
      descFr: 'Vérification de compte, mot de passe, accès'
    },
    {
      key: 'inquiry',
      labelAr: 'استفسار عام حول المنصة',
      labelFr: 'Demande d\'Information',
      descAr: 'سؤال عن الاشتراكات، الخصوصية، أو طريقة العمل',
      descFr: 'Question générale sur le fonctionnement'
    },
    {
      key: 'suggestion',
      labelAr: 'اقتراح وتطوير الخدمة',
      labelFr: 'Suggestion & Amélioration',
      descAr: 'فكرة جديدة أو تحسين نرحب به بشدة',
      descFr: 'Proposer une idée ou une nouvelle fonctionnalité'
    },
    {
      key: 'other',
      labelAr: 'سبب آخر',
      labelFr: 'Autre motif',
      descAr: 'موضوع مختلف لم يذكر في القائمة',
      descFr: 'Autre sujet spécifique'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageText.trim()) {
      setErrorMsg(isAr ? 'يرجى كتابة عنوان الرسالة وتفاصيل الطلب.' : 'Veuillez remplir le sujet et la description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const selectedOption = typeOptions.find(t => t.key === requestType);
    const typeLabel = isAr ? selectedOption?.labelAr : selectedOption?.labelFr;

    const newTicket: ContactTicket = {
      id: 'TKT-' + Date.now().toString().slice(-6),
      type: requestType,
      typeName: typeLabel || requestType,
      senderName: senderName || (isAr ? 'مستخدم المنصة' : 'Membre Mawada'),
      contactInfo: contactInfo || (isAr ? 'غير محدد' : 'Non renseigné'),
      subject: subject.trim(),
      message: messageText.trim(),
      createdAt: new Date().toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'pending'
    };

    // Save ticket locally for persistent admin view
    setTimeout(() => {
      try {
        const savedTicketsRaw = localStorage.getItem('mawada_contact_tickets');
        const ticketsList = savedTicketsRaw ? JSON.parse(savedTicketsRaw) : [];
        ticketsList.unshift(newTicket);
        localStorage.setItem('mawada_contact_tickets', JSON.stringify(ticketsList));
      } catch (err) {
        console.error('Error saving ticket:', err);
      }

      setIsSubmitting(false);
      setSubmittedTicket(newTicket);
    }, 600);
  };

  const handleResetModal = () => {
    setSubmittedTicket(null);
    setSubject('');
    setMessageText('');
    setContactInfo('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#0F172A] w-full max-w-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-5 bg-[#070B14] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <LifeBuoy className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black font-serif text-slate-100 flex items-center gap-2">
                <span>{isAr ? 'مركز اتصل بنا والدعم الفني' : 'Nous Contacter & Support Client'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'أرسل استفسارك، شكواك، أو طلبك لفريق إدارة المنصة' : 'Envoyez votre réclamation, question ou demande à l\'équipe'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetModal}
            className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {submittedTicket ? (
            /* Success Feedback View */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100">
                  {isAr ? 'تم استلام طلبك بنجاح!' : 'Demande transmise avec succès !'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {isAr 
                    ? 'يقوم فريق خدمة الزبائن والمشرفين بمراجعة جميع الطلبات والشكاوى الرد عليها في أقرب وقت.'
                    : 'Notre équipe de modération examinera votre message et vous répondra très rapidement.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-amber-500/30 max-w-md mx-auto text-xs space-y-2 text-right rtl:text-right ltr:text-left">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{isAr ? 'رقم التتبع المرجعي:' : 'Numéro de ticket :'}</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {submittedTicket.id}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{isAr ? 'نوع الطلب:' : 'Type de demande :'}</span>
                  <span className="font-bold text-slate-200">{submittedTicket.typeName}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{isAr ? 'العنوان:' : 'Sujet :'}</span>
                  <span className="font-bold text-slate-200 truncate max-w-[200px]">{submittedTicket.subject}</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">{isAr ? 'تاريخ الإرسال:' : 'Date d\'envoi :'}</span>
                  <span className="text-slate-300">{submittedTicket.createdAt}</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleResetModal}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg"
                >
                  {isAr ? 'إغلاق والعودة للتطبيق' : 'Fermer'}
                </button>
              </div>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-4">

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Request Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 block">
                  {isAr ? '1. حدد نوع الطلب أو الشكوى *' : '1. Sélectionnez le type de demande *'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {typeOptions.map((opt) => {
                    const isSelected = requestType === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => setRequestType(opt.key)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/80 ring-1 ring-amber-500/40'
                            : 'bg-[#0A0F1D] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                            {isAr ? opt.labelAr : opt.labelFr}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {isAr ? opt.descAr : opt.descFr}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isAr ? 'الاسم الكامل أو المستعار' : 'Nom / Pseudo'}
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={isAr ? 'مثال: وليد' : 'Ex: Walid'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isAr ? 'وسيلة الاتصال (بريد أو هاتف)' : 'Email ou Numéro de téléphone'}
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder={isAr ? 'مثال: 0661xxxxxx أو email@domain.com' : 'Ex: 0661xxxxxx ou email@domain.com'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Step 3: Subject */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  {isAr ? 'عنوان الموضوع أو فحوى الشكوى *' : 'Sujet du message *'}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    isAr 
                      ? 'مثال: إبلاغ عن مضايقة في الرسائل / مشكلة في تغيير الولاية' 
                      : 'Ex: Signaler un harcèlement / Problème de modification de wilaya'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Step 4: Message Text */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  {isAr ? 'التفاصيل والمعلومات الكاملة *' : 'Description détaillée *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    isAr 
                      ? 'اكتب هنا كل التفاصيل المفيدة لمساعدتك وتلقي رد سريع...' 
                      : 'Décrivez précisément votre problème ou votre requête...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Safety & Confidentiality Note */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {isAr 
                    ? 'جميع طلبات الشكاوى والمعلومات تعالج بكرامة وخصوصية تامة من طرف فريق الدعم.' 
                    : 'Toutes les réclamations sont traitées dans la plus stricte confidentialité.'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Envoi...') : (isAr ? 'إرسال الطلب الآن' : 'Envoyer la demande')}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
