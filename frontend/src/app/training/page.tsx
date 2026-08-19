'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, TrainingCourse, TrainingApplicationPayload } from '@/lib/api';

const iconMap: Record<string, string> = {
  'computer-digital-literacy': '💻',
  'microsoft-excel-data-analysis': '📊',
  'advanced-excel-business-reporting': '📈',
  'graphic-design-canva': '🎨',
  'social-media-management': '📱',
  'digital-marketing': '📣',
  'wordpress-website-design': '🌐',
  'web-development-fundamentals': '🧑‍💻',
  'business-process-automation': '⚙️',
  'ai-productivity-tools': '🤖',
  'cybersecurity-awareness': '🛡️',
  'cloud-computing-fundamentals': '☁️',
  'database-fundamentals': '🗄️',
  'api-development-integration': '🔗',
  'freelancing-digital-entrepreneurship': '🚀',
  'ecommerce-online-business': '🛒',
  'digital-project-management': '📋',
  'digital-transformation': '🏢',
};

const fallbackCourses: TrainingCourse[] = [
  {
    slug: 'computer-digital-literacy',
    name: 'Computer Fundamentals & Digital Literacy',
    category: 'Digital Foundations',
    icon: '💻',
    level: 'Beginner',
    description:
      'Build the essential computer and digital skills needed for modern work, study and business.',
    featured: true,
  },
  {
    slug: 'microsoft-excel-data-analysis',
    name: 'Microsoft Excel & Data Analysis',
    category: 'Productivity & Data',
    icon: '📊',
    level: 'Beginner to Intermediate',
    description:
      'Learn practical Excel skills for organising, analysing and presenting business data.',
    featured: true,
  },
  {
    slug: 'advanced-excel-business-reporting',
    name: 'Advanced Excel & Business Reporting',
    category: 'Productivity & Data',
    icon: '📈',
    level: 'Intermediate to Advanced',
    description:
      'Create advanced formulas, dashboards, reports and decision-ready business insights.',
    featured: true,
  },
  {
    slug: 'graphic-design-canva',
    name: 'Graphic Design with Canva',
    category: 'Creative & Media',
    icon: '🎨',
    level: 'Beginner',
    description:
      'Create professional graphics, presentations, social content and marketing materials.',
    featured: false,
  },
  {
    slug: 'social-media-management',
    name: 'Social Media Management',
    category: 'Marketing & Business',
    icon: '📱',
    level: 'Beginner to Intermediate',
    description:
      'Plan, manage and grow professional social media presence for brands and organisations.',
    featured: false,
  },
  {
    slug: 'digital-marketing',
    name: 'Digital Marketing',
    category: 'Marketing & Business',
    icon: '📣',
    level: 'Beginner to Intermediate',
    description:
      'Learn practical digital marketing strategies for reaching customers and growing a business.',
    featured: true,
  },
  {
    slug: 'wordpress-website-design',
    name: 'Website Design with WordPress',
    category: 'Web & Technology',
    icon: '🌐',
    level: 'Beginner to Intermediate',
    description:
      'Build, customise and manage professional websites using WordPress.',
    featured: false,
  },
  {
    slug: 'web-development-fundamentals',
    name: 'Web Development Fundamentals',
    category: 'Web & Technology',
    icon: '🧑‍💻',
    level: 'Beginner',
    description:
      'Learn the foundations of HTML, CSS, JavaScript and modern web development.',
    featured: true,
  },
  {
    slug: 'business-process-automation',
    name: 'Business Process Automation',
    category: 'Business & Technology',
    icon: '⚙️',
    level: 'Intermediate',
    description:
      'Identify repetitive processes and use digital tools to make operations faster and more efficient.',
    featured: false,
  },
  {
    slug: 'ai-productivity-tools',
    name: 'Artificial Intelligence & Productivity Tools',
    category: 'Emerging Technology',
    icon: '🤖',
    level: 'Beginner to Intermediate',
    description:
      'Use modern AI tools responsibly to improve research, writing, productivity, analysis and workflows.',
    featured: true,
  },
  {
    slug: 'cybersecurity-awareness',
    name: 'Cybersecurity Awareness',
    category: 'Security',
    icon: '🛡️',
    level: 'Beginner',
    description:
      'Understand common cyber threats and practical ways to protect people, devices and organisations.',
    featured: false,
  },
  {
    slug: 'cloud-computing-fundamentals',
    name: 'Cloud Computing Fundamentals',
    category: 'Cloud & Infrastructure',
    icon: '☁️',
    level: 'Beginner to Intermediate',
    description:
      'Understand cloud platforms, infrastructure, deployment models and modern digital infrastructure.',
    featured: false,
  },
  {
    slug: 'database-fundamentals',
    name: 'Database Fundamentals',
    category: 'Web & Technology',
    icon: '🗄️',
    level: 'Beginner to Intermediate',
    description:
      'Learn how databases are structured, queried and used to power digital applications.',
    featured: false,
  },
  {
    slug: 'api-development-integration',
    name: 'APIs & Digital Integration',
    category: 'Web & Technology',
    icon: '🔗',
    level: 'Intermediate',
    description:
      'Understand APIs, integrations and how modern digital systems communicate with each other.',
    featured: false,
  },
  {
    slug: 'freelancing-digital-entrepreneurship',
    name: 'Freelancing & Digital Entrepreneurship',
    category: 'Career & Entrepreneurship',
    icon: '🚀',
    level: 'Beginner',
    description:
      'Learn how to build a digital career, find opportunities and structure sustainable online services.',
    featured: true,
  },
  {
    slug: 'ecommerce-online-business',
    name: 'E-commerce & Online Business',
    category: 'Business & Entrepreneurship',
    icon: '🛒',
    level: 'Beginner to Intermediate',
    description:
      'Learn the foundations of launching, managing and growing an online business.',
    featured: false,
  },
  {
    slug: 'digital-project-management',
    name: 'Digital Project Management',
    category: 'Business & Management',
    icon: '📋',
    level: 'Intermediate',
    description:
      'Learn practical methods for planning, coordinating and delivering technology projects.',
    featured: false,
  },
  {
    slug: 'digital-transformation',
    name: 'Technology & Digital Transformation for Organisations',
    category: 'Business & Management',
    icon: '🏢',
    level: 'Professional',
    description:
      'Help teams understand, adopt and manage technology-driven organisational change.',
    featured: true,
  },
];

const emptyForm: TrainingApplicationPayload = {
  full_name: '',
  email: '',
  phone: '',
  course: '',
  learning_goal: '',
  experience_level: '',
  preferred_schedule: '',
  delivery_mode: '',
  preferred_batch: '',
  notes: '',
  hp_field_9x2: '',
};

export default function TrainingPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>(fallbackCourses);
  const [category, setCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [form, setForm] = useState<TrainingApplicationPayload>(emptyForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    api
      .getTrainingCourses()
      .then((response) => {
        if (active && response?.data?.length) {
          setCourses(
            response.data.map((course) => ({
              ...course,
              icon: iconMap[course.slug] || course.icon || '🎓',
            })),
          );
        }
      })
      .catch(() => {
        // Keep the curated fallback catalogue if the API is temporarily unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(courses.map((course) => course.category)))],
    [courses],
  );

  const filteredCourses = useMemo(
    () =>
      category === 'All'
        ? courses
        : courses.filter((course) => course.category === category),
    [category, courses],
  );

  const featuredCourses = courses.filter((course) => course.featured).slice(0, 6);

  function chooseCourse(slug: string) {
    setSelectedCourse(slug);
    setForm((current) => ({ ...current, course: slug }));
    document.getElementById('training-enquiry')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      await api.submitTrainingApplication(form);
      setStatus('sent');
      setForm({ ...emptyForm });
      setSelectedCourse('');
    } catch (error) {
      setStatus('error');
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'We could not submit your enquiry. Please try again.',
      );
    }
  }

  return (
    <>
      <Navbar />

      <main className="pt-[120px]">
        {/* Hero */}
        <section className="bg-navy-primary text-white">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 lg:py-28">
            <div className="max-w-3xl">
              <div className="font-mono text-[12px] font-medium text-blue-300 uppercase tracking-[0.2em] mb-4">
                Abeekey Training & Capacity Building
              </div>

              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6">
                Build skills that move you forward.
              </h1>

              <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-2xl mb-8">
                Practical digital and technology training designed for students,
                professionals, entrepreneurs, teams and organisations.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#programmes"
                  className="inline-flex justify-center px-6 py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)]"
                >
                  Explore programmes
                </a>

                <a
                  href="#training-enquiry"
                  className="inline-flex justify-center px-6 py-3.5 rounded-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Enquire about training
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Positioning */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Practical learning',
                text: 'Focus on skills you can immediately apply to work, business, study and real projects.',
              },
              {
                icon: '🧩',
                title: 'Flexible programmes',
                text: 'Training can be adapted around your experience, goals, audience, schedule and delivery format.',
              },
              {
                icon: '🏢',
                title: 'Individuals & organisations',
                text: 'We support individual learners as well as teams, institutions, NGOs and businesses.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-slate-200 rounded-lg p-7 bg-white"
              >
                <div className="text-2xl mb-4">{item.icon}</div>
                <h2 className="font-heading font-semibold text-navy-primary text-lg mb-2">
                  {item.title}
                </h2>
                <p className="text-text-soft text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section id="programmes" className="bg-slate-50 py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl mb-12">
              <div className="font-mono text-[12px] font-medium text-blue-primary uppercase tracking-widest mb-3">
                Featured programmes
              </div>

              <h2 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl mb-4">
                Skills built around real-world outcomes.
              </h2>

              <p className="text-text-soft text-lg">
                Start with one of our most requested programmes or speak with us
                about a customised learning path.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  featured
                  onSelect={chooseCourse}
                />
              ))}
            </div>
          </div>
        </section>

        {/* All programmes */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7 mb-10">
            <div>
              <div className="font-mono text-[12px] font-medium text-blue-primary uppercase tracking-widest mb-3">
                Training catalogue
              </div>

              <h2 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl">
                Explore all programmes
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-colors ${
                    category === item
                      ? 'bg-navy-primary text-white border-navy-primary'
                      : 'bg-white text-navy-secondary border-slate-200 hover:border-blue-primary hover:text-blue-primary'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.slug}
                course={course}
                onSelect={chooseCourse}
              />
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="bg-navy-primary text-white py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <div className="font-mono text-[12px] font-medium text-blue-300 uppercase tracking-widest mb-3">
                  Who we train
                </div>

                <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-5">
                  Training for where you are — and where you want to go.
                </h2>

                <p className="text-white/65 leading-relaxed">
                  Whether you are starting from zero, improving your professional
                  capabilities or preparing a team for digital transformation,
                  we can structure the learning around your actual objectives.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ['🎓', 'Students & graduates'],
                  ['💼', 'Professionals'],
                  ['🚀', 'Entrepreneurs'],
                  ['👥', 'Business teams'],
                  ['🏛️', 'Institutions & NGOs'],
                  ['🌱', 'Career changers'],
                ].map(([icon, label]) => (
                  <div
                    key={label}
                    className="border border-white/10 bg-white/[0.04] rounded-lg p-5"
                  >
                    <span className="text-xl mr-2">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <div className="font-mono text-[12px] font-medium text-blue-primary uppercase tracking-widest mb-3">
              How it works
            </div>

            <h2 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl">
              A straightforward path from enquiry to learning.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              ['01', 'Choose a programme', 'Tell us the skill or programme you are interested in.'],
              ['02', 'Share your goals', 'Tell us your experience, objectives and preferred schedule.'],
              ['03', 'We tailor the plan', 'We recommend the appropriate format, duration and delivery approach.'],
              ['04', 'Start learning', 'Begin a practical programme focused on measurable skills and outcomes.'],
            ].map(([number, title, text]) => (
              <div key={number} className="border-t-2 border-blue-primary pt-5">
                <div className="font-mono text-xs text-blue-primary mb-4">{number}</div>
                <h3 className="font-heading font-semibold text-navy-primary mb-2">
                  {title}
                </h3>
                <p className="text-text-soft text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Enquiry */}
        <section
          id="training-enquiry"
          className="bg-slate-50 border-t border-slate-200 py-20"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-14">
              <div>
                <div className="font-mono text-[12px] font-medium text-blue-primary uppercase tracking-widest mb-3">
                  Training enquiry
                </div>

                <h2 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl mb-5">
                  Tell us what you want to learn.
                </h2>

                <p className="text-text-soft leading-relaxed mb-7">
                  Share a few details and our team will recommend the appropriate
                  programme and delivery options.
                </p>

                <div className="space-y-4 text-sm text-text-soft">
                  <div className="flex gap-3">
                    <span>✓</span>
                    <span>Individual and group training</span>
                  </div>
                  <div className="flex gap-3">
                    <span>✓</span>
                    <span>Flexible online and in-person options</span>
                  </div>
                  <div className="flex gap-3">
                    <span>✓</span>
                    <span>Beginner through professional-level programmes</span>
                  </div>
                  <div className="flex gap-3">
                    <span>✓</span>
                    <span>Custom programmes for organisations</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
                {status === 'sent' ? (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-4">✓</div>
                    <h3 className="font-heading font-bold text-navy-primary text-xl mb-2">
                      Enquiry received.
                    </h3>
                    <p className="text-text-soft text-sm">
                      Thank you. Our team will contact you with the appropriate
                      programme and delivery options.
                    </p>

                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-sm font-semibold text-blue-primary hover:underline"
                    >
                      Submit another enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot — hidden from real users, bots that auto-fill every field will trip it.
                        Field name deliberately avoids "website"/"url"/"company" etc. so browser
                        autofill doesn't populate it and false-flag real users. */}
                    <input
                      type="text"
                      name="hp_field_9x2"
                      id="hp_field_9x2"
                      value={form.hp_field_9x2}
                      onChange={(e) => setForm({ ...form, hp_field_9x2: e.target.value })}
                      tabIndex={-1}
                      autoComplete="new-password"
                      aria-hidden="true"
                      className="absolute -left-[9999px] w-px h-px opacity-0"
                    />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field
                        label="Full name"
                        required
                        value={form.full_name}
                        onChange={(value) =>
                          setForm({ ...form, full_name: value })
                        }
                      />

                      <Field
                        label="Email address"
                        required
                        type="email"
                        value={form.email}
                        onChange={(value) =>
                          setForm({ ...form, email: value })
                        }
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field
                        label="Phone number"
                        required
                        value={form.phone}
                        onChange={(value) =>
                          setForm({ ...form, phone: value })
                        }
                      />

                      <div>
                        <label className="block text-xs font-semibold text-navy-secondary mb-2">
                          Programme
                        </label>
                        <select
                          required
                          value={selectedCourse}
                          onChange={(event) => {
                            setSelectedCourse(event.target.value);
                            setForm({
                              ...form,
                              course: event.target.value,
                            });
                          }}
                          className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                        >
                          <option value="">Select a programme</option>
                          {courses.map((course) => (
                            <option key={course.slug} value={course.slug}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-secondary mb-2">
                        Learning goal
                      </label>
                      <textarea
                        rows={3}
                        value={form.learning_goal}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            learning_goal: event.target.value,
                          })
                        }
                        placeholder="What do you want to be able to do after the training?"
                        className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <SelectField
                        label="Experience level"
                        value={form.experience_level || ''}
                        options={[
                          'Beginner',
                          'Some experience',
                          'Intermediate',
                          'Advanced',
                          'Professional',
                        ]}
                        onChange={(value) =>
                          setForm({
                            ...form,
                            experience_level: value,
                          })
                        }
                      />

                      <SelectField
                        label="Preferred schedule"
                        value={form.preferred_schedule || ''}
                        options={[
                          'Weekday mornings',
                          'Weekday afternoons',
                          'Weekday evenings',
                          'Weekends',
                          'Flexible',
                        ]}
                        onChange={(value) =>
                          setForm({
                            ...form,
                            preferred_schedule: value,
                          })
                        }
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <SelectField
                        label="Delivery mode"
                        value={form.delivery_mode || ''}
                        options={[
                          'Online',
                          'In-person',
                          'Hybrid',
                          'Organisation / group training',
                        ]}
                        onChange={(value) =>
                          setForm({
                            ...form,
                            delivery_mode: value,
                          })
                        }
                      />

                      <Field
                        label="Preferred batch"
                        value={form.preferred_batch || ''}
                        placeholder="Optional"
                        onChange={(value) =>
                          setForm({
                            ...form,
                            preferred_batch: value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-secondary mb-2">
                        Additional notes
                      </label>
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            notes: event.target.value,
                          })
                        }
                        placeholder="Anything else we should know?"
                        className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                      />
                    </div>

                    {status === 'error' && (
                      <p className="text-red-600 text-sm">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
                    >
                      {status === 'sending'
                        ? 'Sending enquiry...'
                        : 'Send training enquiry'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
          <div className="text-center mb-10">
            <div className="font-mono text-[12px] font-medium text-blue-primary uppercase tracking-widest mb-3">
              FAQ
            </div>
            <h2 className="font-heading font-bold text-navy-primary text-3xl">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            <details className="border border-slate-200 rounded-lg p-5">
              <summary className="cursor-pointer font-heading font-semibold text-navy-primary">
                Do you publish fixed training prices?
              </summary>
              <p className="mt-3 text-sm text-text-soft leading-relaxed">
                Training can vary according to the programme, duration, audience,
                class size and delivery format. Submit an enquiry and we will
                recommend the appropriate arrangement.
              </p>
            </details>

            <details className="border border-slate-200 rounded-lg p-5">
              <summary className="cursor-pointer font-heading font-semibold text-navy-primary">
                Can organisations request private training?
              </summary>
              <p className="mt-3 text-sm text-text-soft leading-relaxed">
                Yes. We can structure programmes for businesses, schools, NGOs,
                institutions and other organisations around their operational needs.
              </p>
            </details>

            <details className="border border-slate-200 rounded-lg p-5">
              <summary className="cursor-pointer font-heading font-semibold text-navy-primary">
                Can beginners participate?
              </summary>
              <p className="mt-3 text-sm text-text-soft leading-relaxed">
                Yes. Several programmes are designed specifically for beginners,
                while others support intermediate and professional learners.
              </p>
            </details>

            <details className="border border-slate-200 rounded-lg p-5">
              <summary className="cursor-pointer font-heading font-semibold text-navy-primary">
                Can a programme be customised?
              </summary>
              <p className="mt-3 text-sm text-text-soft leading-relaxed">
                Yes. For organisations and specialised requirements, programme
                content, duration, delivery format and class structure can be
                discussed during the enquiry process.
              </p>
            </details>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function CourseCard({
  course,
  featured = false,
  onSelect,
}: {
  course: TrainingCourse;
  featured?: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <article className="bg-white border border-slate-200 rounded-lg p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="w-11 h-11 rounded-md bg-blue-primary/[0.07] flex items-center justify-center text-xl">
          {iconMap[course.slug] || course.icon || '🎓'}
        </div>

        {featured && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-primary/[0.08] text-blue-primary">
            Featured
          </span>
        )}
      </div>

      <div className="font-mono text-[10px] text-blue-primary uppercase tracking-wider mb-2">
        {course.category}
      </div>

      <h3 className="font-heading font-semibold text-navy-primary text-lg leading-snug mb-2">
        {course.name}
      </h3>

      <p className="text-text-soft text-sm leading-relaxed mb-5">
        {course.description}
      </p>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <span className="text-xs font-medium text-navy-secondary">
          {course.level}
        </span>

        <button
          type="button"
          onClick={() => onSelect(course.slug)}
          className="text-xs font-semibold text-blue-primary hover:text-blue-accent"
        >
          Enquire →
        </button>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-navy-secondary mb-2">
        {label}
        {required && <span className="text-blue-primary ml-1">*</span>}
      </label>

      <input
        required={required}
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-navy-secondary mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}