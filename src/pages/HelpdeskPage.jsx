import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const faqs = [
  {
    q: 'How do I earn coins?',
    a: 'You earn coins by completing workouts. Each workout has a listed coin reward (🪙) shown on the workout card. Premium workouts give bonus coins.',
  },
  {
    q: 'How does the streak system work?',
    a: 'Log at least one workout per day to maintain your streak. Missing a day resets it. A 7-day streak unlocks bonus coins.',
  },
  {
    q: 'Can I switch my fitness goal?',
    a: 'Yes! Go to Settings → Goals & Plans and select a new primary goal. Your recommended workouts will update automatically.',
  },
  {
    q: 'What is the Family Plan?',
    a: 'The Family Plan lets up to 5 members share a Premium subscription. The plan owner can invite members from the Family tab.',
  },
  {
    q: 'How do I upgrade to Premium?',
    a: 'Go to the Subscription page from the dashboard. Premium unlocks exclusive workouts, advanced analytics, and priority support.',
  },
  {
    q: 'How do I reset my password?',
    a: 'Go to Settings → Privacy & Security → Change Password. You can also use Forgot Password on the login screen.',
  },
];

const categories = [
  { label: 'Account & Profile', icon: '👤' },
  { label: 'Workouts & Plans', icon: '🏋️' },
  { label: 'Coins & Rewards', icon: '🪙' },
  { label: 'Subscription', icon: '⭐' },
  { label: 'Technical Issue', icon: '🛠️' },
  { label: 'Other', icon: '💬' },
];

export default function HelpdeskPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [openFaq, setOpenFaq] = useState(null);
  const [ticket, setTicket] = useState({ category: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('faq');

  const handleSubmit = async () => {
    if (!ticket.category || !ticket.subject || !ticket.message) return;
    setSubmitting(true);
    try {
      await api.post('/helpdesk/tickets', {
        ...ticket,
        userId: user?._id,
        email: user?.email,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            💬 <span className="gradient-text">{t('helpSupport', 'Help & Support')}</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{t('findAnswers', 'Find answers or contact our support team.')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'faq', label: t('tabFaq', '❓ FAQ') },
            { id: 'ticket', label: t('tabTicket', '📩 Contact Support') },
          ].map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === tb.id ? '#6C63FF' : 'rgba(255,255,255,0.06)',
                color: tab === tb.id ? '#fff' : '#9CA3AF',
                border: 'none', cursor: 'pointer'
              }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {tab === 'faq' && (
          <div className="glass rounded-2xl p-6 mb-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: '#6C63FF' }}>{t('faqTitle', 'Frequently Asked Questions')}</h3>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  className="w-full text-left py-4 flex items-center justify-between gap-3"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <span style={{ color: '#6C63FF', fontSize: 18, flexShrink: 0, transition: 'transform 0.2s',
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </button>
                {openFaq === i && (
                  <p className="text-sm text-gray-400 pb-4 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ticket Tab */}
        {tab === 'ticket' && (
          submitted ? (
            <div className="glass rounded-2xl p-10 text-center">
              <span style={{ fontSize: 48 }}>✅</span>
              <h3 className="text-xl font-bold mt-4 mb-2" style={{ color: '#43E97B' }}>{t('ticketSubmitted', 'Ticket Submitted!')}</h3>
              <p className="text-sm text-gray-400">Our team will get back to you at <strong>{user?.email}</strong> within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setTicket({ category: '', subject: '', message: '' }); }}
                className="mt-6 btn-gradient px-6 py-2 rounded-xl text-white text-sm font-semibold">
                {t('submitAnother', 'Submit another')}
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-sm mb-4" style={{ color: '#6C63FF' }}>{t('submitTicket', 'Submit a Support Ticket')}</h3>

              {/* Category picker */}
              <div className="mb-5">
                <label className="text-xs text-gray-400 block mb-2">{t('category', 'Category')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(c => (
                    <button key={c.label} onClick={() => setTicket({ ...ticket, category: c.label })}
                      className="rounded-xl p-3 text-center text-xs font-medium transition-all"
                      style={{
                        background: ticket.category === c.label ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)',
                        border: ticket.category === c.label ? '1px solid #6C63FF' : '1px solid rgba(255,255,255,0.1)',
                        color: ticket.category === c.label ? '#6C63FF' : '#9CA3AF',
                        cursor: 'pointer'
                      }}>
                      <span style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">{t('subject', 'Subject')}</label>
                <input type="text" value={ticket.subject}
                  onChange={e => setTicket({ ...ticket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full rounded-xl px-4 py-2 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>

              {/* Message */}
              <div className="mb-5">
                <label className="text-xs text-gray-400 block mb-2">{t('message', 'Message')}</label>
                <textarea value={ticket.message}
                  onChange={e => setTicket({ ...ticket, message: e.target.value })}
                  rows={5} placeholder="Describe your issue in detail..."
                  className="w-full rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }} />
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full btn-gradient py-3 rounded-xl text-white font-semibold text-sm">
                {submitting ? t('loading', 'Submitting...') : t('sendTicket', 'Send Ticket →')}
              </button>
            </div>
          )
        )}

        {/* Contact info */}
        <div className="glass rounded-2xl p-5 mt-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#43E97B' }}>{t('otherWays', 'Other ways to reach us')}</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span>📧</span>
              <span className="text-sm text-gray-300">support@yourfitnessapp.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span>⏱</span>
              <span className="text-sm text-gray-400">Response within 24 hours</span>
            </div>
            {user?.subscription?.plan === 'premium' && (
              <div className="flex items-center gap-3">
                <span>⭐</span>
                <span className="text-sm" style={{ color: '#FFC107' }}>Priority support active (Premium)</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
