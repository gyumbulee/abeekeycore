'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, TrainingCourse } from '@/lib/api';

const FALLBACK_COURSES: TrainingCourse[] = [
  { slug: 'ms-excel', name: 'Microsoft Excel', price: 4500, sessions: 9 },
  { slug: 'digital-marketing', name: 'Digital Marketing', price: 4500, sessions: 9 },
  { slug: 'graphic-design', name: 'Basic Graphic Design (Canva)', price: 4500, sessions: 9 },
];

const COURSE_DESCRIPTIONS: Record<string, string> = {
  'ms-excel': 'From spreadsheet basics to formulas, pivot tables, and dashboards for everyday business use.',
  'digital-marketing': 'Social media, content, and basic ad strategy for growing a business online.',
  'graphic-design': 'Design flyers, posters, and social media graphics using Canva — no prior design experience needed.',
};

export default function TrainingPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>(FALLBACK_COURSES);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', course: '', preferred_batch: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api
      .getTrainingCourses()
      .then((res) => setCourses(res.data))
      .catch(() => {
        /* keep fallback list if the API isn't reachable yet */
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course) {
      setStatus('error');
      setErrorMsg('Please select a course.');
      return;
    }
    setStatus('sending');
    try {
      await api.submitTrainingApplication(form);
      setStatus('sent');
      setForm({ full_name: '', email: '', phone: '', course: '', preferred_batch: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <Navbar />

      <header className="bg-navy-primary pt-[150px] pb-20 px-8 text-center">
        <div className="font-mono text-[13px] font-medium text-[#93c5fd] uppercase tracking-widest mb-3">
          Capacity Building
        </div>
        <h1 className="font-heading font-bold text-white text-[clamp(30px,4vw,44px)] mb-4">
          Abeekey Training Programme
        </h1>
        <p className="text-white/70 max-w-xl mx-auto">
          Practical, affordable digital skills training — three weeks, three sessions a week,
          taught by working professionals.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-20">
        <div className="grid sm:grid-cols-3 gap-6 mb-20">
          {courses.map((course) => (
            <div
              key={course.slug}
              className="bg-white border border-slate-200 rounded-[20px] p-7 flex flex-col"
            >
              <h3 className="font-heading font-semibold text-navy-primary text-lg mb-2">{course.name}</h3>
              <p className="text-text-soft text-sm mb-5 flex-1">
                {COURSE_DESCRIPTIONS[course.slug] ?? 'Hands-on, practical training delivered over three weeks.'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-blue-primary font-semibold">
                  ₦{course.price.toLocaleString()}
                </span>
                <span className="text-text-soft">{course.sessions} sessions</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="font-heading font-bold text-navy-primary text-2xl text-center mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: '3 weeks, 3 days a week',
                desc: 'Each course runs for 9 sessions total — three sessions a week, spread across three weeks, so it fits around work or school.',
              },
              {
                step: '2',
                title: 'Hands-on, practical training',
                desc: 'Every session is built around real tasks you can apply immediately, not just theory — taught by working professionals.',
              },
              {
                step: '3',
                title: 'Certificate on completion',
                desc: 'Attend at least 7 of the 9 sessions and complete the final assessment to receive your Abeekey certificate of completion.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-navy-primary text-white font-heading font-bold flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-heading font-semibold text-navy-primary mb-2">{s.title}</h3>
                <p className="text-text-soft text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20 max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-navy-primary text-2xl text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: 'Do I need any prior experience?',
                a: 'No — all three courses are designed for beginners. We start from the basics and build up from there.',
              },
              {
                q: 'What do I need to attend?',
                a: 'A laptop or computer you can practice on. If you don\u2019t have one, let us know when you apply and we\u2019ll advise on options.',
              },
              {
                q: 'How and when do I pay?',
                a: 'After you apply, we\u2019ll email you payment instructions. Your seat is confirmed once payment is received.',
              },
              {
                q: 'What if I miss a session?',
                a: 'You can still complete the course as long as you attend at least 7 of the 9 sessions to remain eligible for certification.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="font-heading font-semibold text-navy-primary text-[15px] mb-2">{item.q}</h3>
                <p className="text-text-soft text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="font-heading font-bold text-navy-primary text-2xl mb-2">Apply now</h2>
            <p className="text-text-soft text-sm">
              Payment instructions will be emailed to you after we receive your application.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="bg-success/10 border border-success/30 text-success rounded-md p-6 text-center font-medium">
              Application received — check your email for payment instructions.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <input
                  required
                  placeholder="Full name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <input
                  required
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
                <input
                  placeholder="Preferred batch (optional)"
                  value={form.preferred_batch}
                  onChange={(e) => setForm({ ...form, preferred_batch: e.target.value })}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
              </div>

              <select
                required
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent text-text bg-white"
              >
                <option value="" disabled>
                  Select a course
                </option>
                {courses.map((course) => (
                  <option key={course.slug} value={course.slug}>
                    {course.name} — ₦{course.price.toLocaleString()}
                  </option>
                ))}
              </select>

              {status === 'error' && <p className="text-danger text-sm">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
              >
                {status === 'sending' ? 'Submitting...' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}