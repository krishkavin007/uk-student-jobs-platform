                                                          // app/page.tsx
                                                          "use client";

                                                          import { useAuth } from "@/app/context/AuthContext";
                                                          import { Header } from "@/components/ui/header";
                                                          import { Button } from "@/components/ui/button";
                                                          import { Badge } from "@/components/ui/badge";
                                                          import { ContactModal } from "@/components/ui/contact-modal";
                                                          import Link from "next/link";
                                                          import Tilt from "react-parallax-tilt";
                                                          import { motion, useScroll, useTransform } from "framer-motion";
                                                          import { useRef, useState, Fragment } from "react";

                                                          // UI components for search/input
                                                          import { Input } from "@/components/ui/input";
                                                          import { SearchIcon, PlusCircleIcon } from "lucide-react";

                                                          import {
                                                            BriefcaseIcon,
                                                            GraduationCapIcon,
                                                            DollarSignIcon,
                                                            ZapIcon,
                                                            LayoutDashboardIcon,
                                                            ArrowRightIcon,
                                                            CheckCircleIcon,
                                                            LightbulbIcon,
                                                            MessageSquareTextIcon,
                                                            TrendingUpIcon,
                                                            LandmarkIcon,
                                                            ClockIcon,
                                                            SparklesIcon,
                                                            CalendarIcon,
                                                            SearchCheckIcon,
                                                            UsersRoundIcon,
                                                            BookOpenTextIcon,
                                                            Building2Icon,
                                                            GlobeIcon,
                                                            WrenchIcon,
                                                            CodeIcon,
                                                            UniversityIcon,
                                                            BuildingIcon,
                                                            LineChartIcon,
                                                            RocketIcon,
                                                            ShieldCheckIcon,
                                                            HandshakeIcon,
                                                            UserCheckIcon,
                                                            GemIcon,
                                                            BriefcaseBusinessIcon,
                                                          } from "lucide-react";


                                                          // --- Framer Motion Variants for Hyper-Sophisticated Animations ---

                                                          // Master container variant for staggering children with a global initial state
                                                          const containerVariants = {
                                                            hidden: { opacity: 0 },
                                                            show: {
                                                              opacity: 1,
                                                              transition: {
                                                                staggerChildren: 0.1, // Reduced stagger for tighter feel
                                                                delayChildren: 0.3, // Reduced delay for quicker entry
                                                              },
                                                            },
                                                          };

                                                          // Text reveal with a distinct "pop" and stretch
                                                          const textPopReveal = {
                                                            hidden: { opacity: 0, y: 50, scaleY: 0.9, skewY: 2 }, // Reduced y, scaleY, skew for less dramatic pop
                                                            show: {
                                                              opacity: 1,
                                                              y: 0,
                                                              scaleY: 1,
                                                              skewY: 0,
                                                              transition: {
                                                                duration: 1.0, // Reduced duration
                                                                ease: [0.2, 0.8, 0.2, 1],
                                                                stiffness: 90, // Slightly less stiff
                                                              },
                                                            },
                                                          };

                                                          // Button/Interactive element reveal
                                                          const buttonEnter = {
                                                            hidden: { opacity: 0, y: 30, scale: 0.95 }, // Reduced y and scale for subtler entry
                                                            show: {
                                                              opacity: 1,
                                                              y: 0,
                                                              scale: 1,
                                                              transition: {
                                                                duration: 0.9, // Reduced duration
                                                                ease: [0.2, 0.8, 0.2, 1],
                                                                type: "spring",
                                                                stiffness: 80, // Slightly less stiff
                                                                damping: 12, // Slightly more damped
                                                              },
                                                            },
                                                          };

                                                          // Card reveal with a complex spring and subtle rotation
                                                          const cardSpringPop = {
                                                            hidden: { opacity: 0, scale: 0.9, y: 50, rotateX: 10 }, // Reduced scale, y, rotateX for subtler effect
                                                            show: {
                                                              opacity: 1,
                                                              scale: 1,
                                                              y: 0,
                                                              rotateX: 0,
                                                              transition: {
                                                                type: "spring",
                                                                stiffness: 60, // Softer spring
                                                                damping: 9, // More damped
                                                                mass: 0.4, // Lighter mass
                                                                ease: "easeOut",
                                                                duration: 1.2, // Reduced duration
                                                              },
                                                            },
                                                          };

                                                          // Icon entry within cards
                                                          const iconEnter = {
                                                            hidden: { opacity: 0, scale: 0.7 }, // Starts smaller
                                                            show: {
                                                              opacity: 1,
                                                              scale: 1,
                                                              transition: {
                                                                type: "spring",
                                                                stiffness: 180, // Slightly less snappy
                                                                damping: 9,
                                                                delay: 0.1, // Slightly less delay
                                                              },
                                                            },
                                                          };

                                                          export default function HomePage() {
                                                            const { user, isLoading, logout } = useAuth();
                                                            const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

                                                            const heroRef = useRef(null);
                                                            const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start end", "end start"] });

                                                            // Parallax for a background layer in the hero
                                                            const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
                                                            const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

                                                            // State for the toggle: 'student' or 'employer'
                                                            const [userRole, setUserRole] = useState<'student' | 'employer'>('student'); // Default to student

                                                            // Theme-safe Tailwind class maps for dynamic colors (ensures classes are generated)
                                                            const gradientClassMap: Record<string, string> = {
                                                              blue: "from-blue-600 to-blue-800 group-hover:from-blue-500 group-hover:to-blue-700",
                                                              green: "from-green-600 to-green-800 group-hover:from-green-500 group-hover:to-green-700",
                                                              yellow: "from-yellow-500 to-yellow-700 group-hover:from-yellow-400 group-hover:to-yellow-600",
                                                              pink: "from-pink-600 to-pink-800 group-hover:from-pink-500 group-hover:to-pink-700",
                                                              red: "from-red-600 to-red-800 group-hover:from-red-500 group-hover:to-red-700",
                                                              indigo: "from-indigo-600 to-indigo-800 group-hover:from-indigo-500 group-hover:to-indigo-700",
                                                              teal: "from-teal-600 to-teal-800 group-hover:from-teal-500 group-hover:to-teal-700",
                                                              orange: "from-orange-600 to-orange-800 group-hover:from-orange-500 group-hover:to-orange-700",
                                                              purple: "from-purple-600 to-purple-800 group-hover:from-purple-500 group-hover:to-purple-700",
                                                            };

                                                            const linkTextClassMap: Record<string, string> = {
                                                              blue: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
                                                              green: "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300",
                                                              yellow: "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300",
                                                              pink: "text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300",
                                                              red: "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300",
                                                              indigo: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
                                                              teal: "text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300",
                                                              orange: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
                                                              purple: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
                                                            };

                                                            const iconTextClassMap: Record<string, string> = {
                                                              yellow: "text-slate-900 dark:text-white",
                                                              blue: "text-white",
                                                              green: "text-white",
                                                              pink: "text-white",
                                                              red: "text-white",
                                                              indigo: "text-white",
                                                              teal: "text-white",
                                                              orange: "text-white",
                                                              purple: "text-white",
                                                            };

                                                            // Conditional content for the rest of the page
                                                            const mainContent = userRole === 'student' ? (
                                                              <>
                                                                {/* Student Value Proposition - Dynamic Grid with Active States */}
                                                                <section className="w-full py-20 md:py-28 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-950 dark:to-gray-900 text-slate-900 dark:text-white relative z-10">
                                                                  {/* Subtle background element for visual depth */}
                                                                  <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-200 rounded-full mix-blend-multiply opacity-10 blur-3xl animate-blob-float-3"></div>

                                                                  <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                                                                    <motion.div
                                                                      variants={containerVariants}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.2 }}
                                                                      className="space-y-6 text-center lg:text-left mb-10 md:mb-12"
                                                                    >
                                                                      <motion.h2 variants={textPopReveal} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                                                        Why Students <span className="text-blue-700 dark:text-blue-600">Choose StudentJobs UK</span>
                                                                      </motion.h2>
                                                                      <motion.p variants={textPopReveal} className="text-base md:text-lg text-slate-700 dark:text-gray-300 leading-relaxed max-w-2xl lg:mx-0 mx-auto font-normal">
                                                                          Discover a curated selection of part-time roles specifically designed to complement your academic life. Gain valuable experience, build your network, and earn competitively while pursuing your studies across the UK. Our platform ensures every opportunity aligns with student success.
                                                                      </motion.p>
                                                                    </motion.div>

                                                                    <motion.div
                                                            variants={containerVariants}
                                                            initial="hidden"
                                                            whileInView="show"
                                                            viewport={{ once: true, amount: 0.1 }}
                                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
                                                          >
                                                            {[
                                                              { icon: GraduationCapIcon, title: "Academic Synergy", text: "Find part-time roles that fit seamlessly into your university timetable, ensuring no conflict with your studies. Your education comes first.", color: "blue" },
                                                              { icon: CheckCircleIcon, title: "Verified & Secure", text: "Every job listing is rigorously vetted to guarantee legitimate, safe, and transparent employment experiences. Your security is paramount.", color: "green" },
                                                              { icon: DollarSignIcon, title: "Competitive Earnings", text: "Access part-time jobs offering competitive wages, empowering you to manage living costs and achieve financial independence.", color: "yellow" },
                                                              { icon: TrendingUpIcon, title: "Career Acceleration", text: "Develop real-world professional skills and significantly boost your career prospects upon graduation. Start building your future now.", color: "purple" },
                                                            ].map((feature, index) => (
                                                              <motion.div key={index} variants={cardSpringPop} className="group">
                                                                <Tilt
                                                                  className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-slate-200 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden"
                                                                  perspective={1000}
                                                                  glareEnable={true}
                                                                  glareMaxOpacity={0.1}
                                                                >
                                                                  <div
                                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                    style={{
                                                                      background: `radial-gradient(circle at center, var(--${feature.color}-500) 0%, transparent 70%)`,
                                                                      mixBlendMode: "overlay",
                                                                    }}
                                                                              ></div>
                                                                              <motion.div variants={iconEnter} className={`w-14 h-14 bg-gradient-to-br ${gradientClassMap[feature.color]} dark:from-${feature.color}-700 dark:to-${feature.color}-900 rounded-full flex items-center justify-center mb-5 shadow-sm transition-colors relative z-10`}>
                                                                                <feature.icon className={`h-7 w-7 ${iconTextClassMap[feature.color]}`} />
                                                                              </motion.div>
                                                                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 leading-snug relative z-10">{feature.title}</h3>
                                                                              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed relative z-10">{feature.text}</p>
                                                                          </Tilt>
                                                                        </motion.div>
                                                                      ))}
                                                                    </motion.div>
                                                                    <motion.div
                                                                      variants={buttonEnter}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.2 }}
                                                                      className="text-center mt-14 md:mt-20"
                                                                    >
                                                                      <Button asChild size="lg" className="h-12 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                                                          <Link href="/browse-jobs" className="flex items-center">Find Your Part-Time Job <ArrowRightIcon className="ml-2 h-5 w-5" /></Link>
                                                                      </Button>
                                                                    </motion.div>
                                                                  </div>
                                                                </section>

                                                                {/* Job Categories - Immersive & Animated Grid */}
                                                          <section className="w-full py-20 md:py-28 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white relative z-10 overflow-hidden">
                                                            {/* Dynamic background pattern for categories */}
                                                            <div className="absolute inset-0 z-0 opacity-10 animate-scale-rotate text-purple-700 dark:text-indigo-400">
                                                              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="currentColor">
                                                                <pattern id="diagonal-category-complex" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                  <path d="M 0 0 L 20 20 M 20 0 L 0 20" fill="none" stroke="currentColor" strokeWidth="0.8"></path>
                                                                </pattern>
                                                                <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonal-category-complex)"></rect>
                                                              </svg>
                                                            </div>

                                                            <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 rounded-full bg-pink-500/10 blur-3xl animate-blob-float-4 -translate-x-1/2 -translate-y-1/2"></div>

                                                            <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl relative z-10">
                                                              <motion.h2
                                                                variants={textPopReveal}
                                                                initial="hidden"
                                                                whileInView="show"
                                                                viewport={{ once: true, amount: 0.3 }}
                                                                className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 drop-shadow-md pb-2"
                                                              >
                                                                Popular Categories: <span className="text-slate-900 dark:text-white">Find Your Fit.</span>
                                                              </motion.h2>

                                                              <motion.p
                                                                variants={textPopReveal}
                                                                initial="hidden"
                                                                whileInView="show"
                                                                viewport={{ once: true, amount: 0.3 }}
                                                                className="text-base md:text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed font-normal">
                                                                Explore a vast and diverse range of part-time job categories available exclusively across the UK. Our platform categorizes thousands of opportunities, ensuring you find roles that precisely match your skills, interests, and career aspirations.
                                                              </motion.p>
                                                          
                                                                    <motion.div
                                                                      variants={containerVariants}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.05 }}
                                                                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
                                                                    >
                                                                      {[
                                                                        { name: "Hospitality", icon: BriefcaseIcon, description: "Flexible shifts in hotels, restaurants, and cafes.", link: "/browse-jobs?category=Hospitality", color: "blue" },
                                                                        { name: "Retail", icon: DollarSignIcon, description: "Customer service and sales roles in various stores.", link: "/browse-jobs?category=Retail", color: "green" },
                                                                        { name: "Tutoring", icon: GraduationCapIcon, description: "Help others learn effectively in academic subjects.", link: "/browse-jobs?category=Tutoring", color: "yellow" },
                                                                        { name: "Admin Support", icon: LayoutDashboardIcon, description: "Office tasks, data entry, and administrative duties.", link: "/browse-jobs?category=Admin Support", color: "pink" },
                                                                        { name: "Tech Support", icon: CodeIcon, description: "Entry-level IT support and tech-related tasks.", link: "/browse-jobs?category=Tech Support", color: "red" },
                                                                        { name: "Marketing", icon: LightbulbIcon, description: "Social media, content creation, and promotional roles.", link: "/browse-jobs?category=Marketing", color: "indigo" },
                                                                        { name: "Customer Service", icon: MessageSquareTextIcon, description: "Assisting customers via phone, email, or chat.", link: "/browse-jobs?category=Customer Service", color: "teal" },
                                                                        { name: "Warehouse & Logistics", icon: WrenchIcon, description: "Roles in inventory, packing, and delivery support.", link: "/browse-jobs?category=Warehouse%20%26%20Logistics", color: "orange" },
                                                                      ].map((category, index) => (
                                                                        <motion.div
                                                                          key={index}
                                                                          variants={cardSpringPop}
                                                                          className="group"
                                                                        >
                                                                          <Link href={category.link} className="block hover:no-underline">
                                                                            <Tilt
                                                                              className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-gray-700 transform group-hover:-translate-y-0.5 relative overflow-hidden`}
                                                                              style={{ borderColor: `var(--${category.color}-600)` }}
                                                                              perspective={1000}
                                                                              glareEnable={true}
                                                                              glareMaxOpacity={0.15}
                                                                              scale={1.02}
                                                                            >
                                                                              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                                                                  style={{
                                                                                      background: `radial-gradient(circle at center, var(--${category.color}-500) 0%, transparent 70%)`,
                                                                                      mixBlendMode: 'overlay'
                                                                                  }}
                                                                              ></div>
                                                                              <motion.div variants={iconEnter} className={`w-14 h-14 bg-gradient-to-br ${gradientClassMap[category.color]} dark:from-${category.color}-700 dark:to-${category.color}-900 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm text-white transition-all duration-300 relative z-10`}>
                                                                                <category.icon className="h-7 w-7 text-white" />
                                                                              </motion.div>
                                                                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 leading-tight relative z-10">{category.name}</h3>
                                                                              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-2.5 relative z-10">{category.description}</p>
                                                                              <Button variant="link" asChild className={`${linkTextClassMap[category.color]} flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300 relative z-10`}>
                                                                                  <div>
                                                                                      Browse Jobs <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                                                                                  </div>
                                                                              </Button>
                                                                            </Tilt>
                                                                          </Link>
                                                                        </motion.div>
                                                                      ))}
                                                                    </motion.div>
                                                                      <motion.div
                                                                      variants={buttonEnter}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.3 }}
                                                                      className="text-center mt-16 md:mt-24"
                                                                    >
                                                                      <Button asChild size="lg" className="h-12 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                                                          <Link href="/browse-jobs" className="flex items-center">View All Openings <ArrowRightIcon className="ml-2 h-5 w-5" /></Link>
                                                                      </Button>
                                                                    </motion.div>
                                                                  </div>
                                                                </section>
                                                              </>
                                                            ) : (
                                                              <>
                                                                {/* NEW: Employer Introduction Block - Modern & Professional */}
                                                                <section className="w-full py-20 md:py-28 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-950 dark:to-gray-900 text-slate-900 dark:text-white relative z-10 overflow-hidden">
                                                                  <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-200 rounded-full mix-blend-multiply opacity-5 blur-3xl animate-blob-float-1"></div>
                                                                  <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-purple-200 rounded-full mix-blend-multiply opacity-5 blur-3xl animate-blob-float-2 animation-delay-1s"></div>

                                                                  <div className="container px-4 md:px-6 mx-auto grid lg:grid-cols-2 gap-10 md:gap-14 items-center max-w-7xl">
                                                                    <motion.div
                                                                      variants={containerVariants}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.2 }}
                                                                      className="space-y-6 text-center lg:text-left"
                                                                    >
                                                                      <motion.h2 variants={textPopReveal} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                                                        Empower Your Business with <span className="text-indigo-700 dark:text-indigo-500">Student Talent</span>
                                                                      </motion.h2>
                                                                      <motion.p variants={textPopReveal} className="text-base md:text-lg text-slate-700 dark:text-gray-300 leading-relaxed max-w-2xl lg:mx-0 mx-auto font-normal">
                                                                        StudentJobs UK is your premier platform for connecting with motivated, skilled university students across the United Kingdom. Discover flexible, dedicated, and bright talent ready to contribute to your company's success.
                                                                      </motion.p>
                                                                      <motion.div variants={buttonEnter}>
                                                                        <Button asChild size="lg" className="h-12 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-3">
                                                                            <Link href="/post-job" className="flex items-center">Post Your First Job <ArrowRightIcon className="ml-2 h-5 w-5" /></Link>
                                                                        </Button>
                                                                      </motion.div>
                                                                    </motion.div>

                                                                    <motion.div
                                                                      initial={{ opacity: 0, x: 80 }}
                                                                      whileInView={{ opacity: 1, x: 0 }}
                                                                      viewport={{ once: true, amount: 0.3 }}
                                                                      transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
                                                                      className="hidden lg:flex justify-center items-center"
                                                                    >
                                                                      <Tilt
                                                                        className="w-full max-w-lg bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 relative overflow-hidden"
                                                                        perspective={1200}
                                                                        glareEnable={true}
                                                                        glareMaxOpacity={0.15}
                                                                        scale={1.01}
                                                                      >
                                                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl z-0"></div>
                                                                        <div className="relative z-10 space-y-5">
                                                                          <div className="flex items-center justify-between">
                                                                            <span className="text-slate-600 dark:text-gray-300 text-sm font-semibold">Job Title</span>
                                                                            <span className="text-slate-500 dark:text-gray-400 text-xs">Posted 2 days ago</span>
                                                                          </div>
                                                                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Part-Time Marketing Assistant</h3>
                                                                          <p className="text-slate-600 dark:text-gray-400 text-sm">
                                                                            Seeking a dynamic university student to support our marketing team. Ideal for those studying marketing, communications, or business.
                                                                          </p>
                                                                          <div className="flex items-center gap-2.5 text-slate-500 dark:text-gray-400 text-xs">
                                                                            <Building2Icon className="h-3.5 w-3.5" /> <span>Innovate Solutions Ltd.</span>
                                                                            <GlobeIcon className="h-3.5 w-3.5" /> <span>London, UK</span>
                                                                            <ClockIcon className="h-3.5 w-3.5" /> <span>20 hrs/week</span>
                                                                          </div>
                                                                          <div className="flex justify-between items-center mt-5">
                                                                            <Badge className="bg-indigo-700 text-indigo-200 text-xs py-0.5 px-2 rounded-full font-medium">Marketing</Badge>
                                                                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1 px-3">Apply Now</Button>
                                                                          </div>
                                                                        </div>
                                                                      </Tilt>
                                                                    </motion.div>
                                                                  </div>
                                                                </section>

                                                                {/* Employer Benefits - Strategic Talent Acquisition with Enhanced Visuals */}
                                                                <section className="w-full py-20 md:py-28 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white relative z-10 overflow-hidden">
                                                                  <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-200 rounded-full mix-blend-multiply opacity-5 blur-3xl animate-blob-float-3 animation-delay-2s"></div>

                                                                  <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl">
                                                                    <motion.div
                                                                      variants={containerVariants}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.2 }}
                                                                      className="space-y-6 mb-10 md:mb-14"
                                                                    >
                                                                      <motion.h2 variants={textPopReveal} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                                                        Why Businesses <span className="text-indigo-700 dark:text-indigo-500">Choose StudentJobs UK</span>
                                                                      </motion.h2>
                                                                      <motion.p variants={textPopReveal} className="text-base md:text-lg text-slate-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal">
                                                                        Access a unique pipeline of highly motivated and skilled university students seeking part-time work. StudentJobs UK makes it effortless to find reliable, adaptable, and dedicated staff ready to integrate into your business and drive success.
                                                                      </motion.p>
                                                                    </motion.div>

                                                                    <motion.div
                                                                      variants={containerVariants}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.1 }}
                                                                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
                                                                    >
                                                                      {[
                                                                        { icon: UserCheckIcon, title: "Qualified Applicants", desc: "Connect directly and quickly with students possessing relevant skills and academic backgrounds for your roles.", color: "indigo" },
                                                                        { icon: RocketIcon, title: "Accelerated Hiring", desc: "Our intuitive platform streamlines the posting and application process, significantly reducing your time-to-hire.", color: "orange" },
                                                                        { icon: HandshakeIcon, title: "Flexible Workforce", desc: "Gain access to a dynamic pool of talent perfect for seasonal peaks, project-based work, or consistent part-time support.", color: "purple" },
                                                                        { icon: LineChartIcon, title: "Growth & Innovation", desc: "Inject fresh perspectives and up-to-date knowledge from the next generation of professionals into your team.", color: "teal" },
                                                                      ].map((item, idx) => (
                                                                        <motion.div key={idx} variants={cardSpringPop} className="group">
                                                                          <Tilt className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-slate-200 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden`} perspective={1000} glareEnable={true} glareMaxOpacity={0.1}>
                                                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                                                                style={{
                                                                                    background: `radial-gradient(circle at center, var(--${item.color}-500) 0%, transparent 70%)`,
                                                                                    mixBlendMode: 'overlay'
                                                                                  }}
                                                                            ></div>
                                                                            <motion.div variants={iconEnter} className={`w-14 h-14 bg-gradient-to-br from-${item.color}-600 to-${item.color}-800 dark:from-${item.color}-700 dark:to-${item.color}-900 text-white rounded-full flex items-center justify-center mb-5 shadow-sm transition-colors group-hover:from-${item.color}-500 group-hover:to-${item.color}-700 dark:group-hover:from-${item.color}-600 dark:group-hover:to-${item.color}-800 relative z-10`}>
                                                                              <item.icon className="h-7 w-7" />
                                                                            </motion.div>
                                                                            <h3 className="text-lg font-bold mb-1.5 text-slate-900 dark:text-white leading-snug relative z-10">{item.title}</h3>
                                                                            <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
                                                                          </Tilt>
                                                                        </motion.div>
                                                                      ))}
                                                                    </motion.div>
                                                                    <motion.div variants={buttonEnter} className="text-center mt-14 md:mt-20">
                                                                      <Button asChild size="lg" className="h-12 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-transparent hover:border-transparent">
                                                                          <Link href="/employer-guide" className="flex items-center">Explore Employer Resources <ArrowRightIcon className="ml-2 h-5 w-5" /></Link>
                                                                      </Button>
                                                                    </motion.div>
                                                                  </div>
                                                                </section>

                                                                {/* Employer-specific content - Detailed Value Proposition */}
                                                                <section className="w-full py-20 md:py-28 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white relative z-10 overflow-hidden">
                                                                  <div className="absolute inset-0 z-0 opacity-10 animate-scale-rotate text-indigo-600 dark:text-indigo-400">
                                                                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="currentColor">
                                                                        <pattern id="diagonal-employer-complex" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                          <path d="M 0 0 L 20 20 M 20 0 L 0 20" fill="none" stroke="currentColor" strokeWidth="0.8"></path>
                                                                        </pattern>
                                                                        <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonal-employer-complex)"></rect>
                                                                      </svg>
                                                                  </div>
                                                                  <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 rounded-full bg-indigo-500/10 blur-3xl animate-blob-float-4 -translate-x-1/2 -translate-y-1/2"></div>

                                                                  <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl relative z-10">
                                                                    <motion.h2
                                                                      variants={textPopReveal}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.3 }}
                                                                      className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 drop-shadow-lg"
                                                                    >
                                                                      The StudentJobs UK <span className="text-slate-900 dark:text-white">Advantage for Businesses.</span>
                                                                    </motion.h2>
                                                                    <motion.p
                                                                      variants={textPopReveal}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.3 }}
                                                                      className="text-base md:text-lg text-slate-700 dark:text-gray-300 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed font-normal">
                                                                      Leverage our platform designed to connect you with the brightest student minds in the UK. We empower your business with adaptable, driven, and cost-effective part-time talent.
                                                                    </motion.p>

                                                                    <motion.div
                                                                      variants={containerVariants}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.05 }}
                                                                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
                                                                    >
                                                                      {[
                                                                        { icon: BriefcaseBusinessIcon, title: "Tailored Solutions", description: "From niche skills to general support, find students perfectly suited to your operational and strategic needs.", color: "blue" },
                                                                        { icon: GemIcon, title: "Premium Talent Pool", description: "Access a curated selection of highly motivated university students, eager to gain experience and contribute meaningfully.", color: "pink" },
                                                                        { icon: ShieldCheckIcon, title: "Assured Reliability", description: "Our verification process ensures you connect with dependable individuals committed to their roles and responsibilities.", color: "green" },
                                                                        { icon: BookOpenTextIcon, title: "Seamless Integration", description: "Students are quick learners and adapt rapidly to new environments, ensuring a smooth onboarding process.", color: "red" },
                                                                        { icon: Building2Icon, title: "Support for All Business Sizes", description: "Whether you're a startup or a large corporation, our platform scales to meet your unique hiring demands.", color: "yellow" },
                                                                        { icon: GlobeIcon, title: "Widespread UK Coverage", description: "Find local talent or remote support from any city across England, Scotland, Wales and Northern Ireland.", color: "purple" },
                                                                      ].map((feature, index) => (
                                                                        <motion.div
                                                                          key={index}
                                                                          variants={cardSpringPop}
                                                                          className="group"
                                                                        >
                                                                          <div className="block hover:no-underline">
                                                                            <Tilt
                                                                              className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-gray-700 transform group-hover:-translate-y-0.5 relative overflow-hidden`}
                                                                              style={{ borderColor: `var(--${feature.color}-600)` }}
                                                                              perspective={1000}
                                                                              glareEnable={true}
                                                                              glareMaxOpacity={0.15}
                                                                              scale={1.02}
                                                                            >
                                                                              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                                                                  style={{
                                                                                      background: `radial-gradient(circle at center, var(--${feature.color}-500) 0%, transparent 70%)`,
                                                                                      mixBlendMode: 'overlay'
                                                                                  }}
                                                                              ></div>
                                                                              <motion.div variants={iconEnter} className={`w-14 h-14 bg-gradient-to-br ${gradientClassMap[feature.color]} dark:from-${feature.color}-700 dark:to-${feature.color}-900 text-white rounded-full flex items-center justify-center mb-5 shadow-sm transition-colors relative z-10`}>
                                                                                <feature.icon className="h-7 w-7" />
                                                                              </motion.div>
                                                                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 leading-tight relative z-10">{feature.title}</h3>
                                                                              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-2.5 relative z-10">{feature.description}</p>
                                                                            </Tilt>
                                                                          </div>
                                                                        </motion.div>
                                                                      ))}
                                                                    </motion.div>
                                                                    <motion.div
                                                                      variants={buttonEnter}
                                                                      initial="hidden"
                                                                      whileInView="show"
                                                                      viewport={{ once: true, amount: 0.3 }}
                                                                      className="text-center mt-16 md:mt-24"
                                                                    >
                                                                      <Button asChild size="lg" className="h-12 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                                                          <Link href="/employer-guide" className="flex items-center">Explore Employer Resources <ArrowRightIcon className="ml-2 h-5 w-5" /></Link>
                                                                      </Button>
                                                                    </motion.div>
                                                                  </div>
                                                                </section>
                                                              </>
                                                            );

                                                            return (
                                                              <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden relative">
                                                                {/*
                                                                  FIXED:
                                                                  - Header is now 'fixed' and has a very high 'z-index' to always be on top.
                                                                  - Header's background is explicitly set to 'bg-gray-900' and text to 'text-white'
                                                                    to ensure visibility against the hero section's dark background, overriding its default styles.
                                                                  - The 'border-b' is removed here to prevent a line that might clash with the hero section.
                                                                */}
                                                                <Header
                                                                  user={user}
                                                                  logout={logout}
                                                                  isLoading={isLoading}
                                                                  pricingHref={pricingHref}
                                                                  currentPage="home"
                                                                  className="fixed top-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-md border-b border-border"
                                                                />

                                                                {/*
                                                                  IMPORTANT FIX:
                                                                  Add padding-top to the main content container to prevent content from hiding
                                                                  underneath the now fixed header. Adjust 'pt-[80px]' as needed based on your header's height.
                                                                */}
                                                                <div className="pt-[px]"> {/* Adjust this padding based on your header's actual height (e.g., h-20 = 80px) */}
                                                                  {/* Hero Section - The Grand Overture with Deep Parallax & Generative Feel */}
                                                                  <section
                                                                    ref={heroRef}
                                                                    className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-indigo-950 dark:via-blue-950 dark:to-purple-950 text-slate-900 dark:text-white shadow-inset-dark py-12"
                                                                  >
                                                                    {/* Generative-like Background Elements (CSS-driven for performance illusion) */}
                                                                    <motion.div
                                                                      className="absolute inset-0 z-0 opacity-20 bg-hero-pattern animate-flow-background"
                                                                      style={{ y: backgroundY, scale: backgroundScale }}
                                                                    >
                                                                      {/* Layer 1: Subtle moving dots */}
                                                                      <div className="absolute inset-0 opacity-70">
                                                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="currentColor">
                                                                          <pattern id="dot-pattern-hero" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                                                            <circle cx="2" cy="2" r="1" fill="rgba(0,0,0,0.1)" className="dark:fill-white/10"></circle>
                                                                          </pattern>
                                                                          <rect x="0" y="0" width="100%" height="100%" fill="url(#dot-pattern-hero)"></rect>
                                                                        </svg>
                                                                      </div>
                                                                      {/* Layer 2: Glowing, pulsing orbs */}
                                                                      <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 rounded-full bg-blue-400/30 dark:bg-blue-500/20 blur-3xl animate-blob-float-1"></div>
                                                                      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-indigo-400/30 dark:bg-purple-500/20 blur-3xl animate-blob-float-2"></div>
                                                                    </motion.div>

                                                                    {/* Dynamic Overlay for Content Readability */}
                                                                    <div className="absolute inset-0 z-10 bg-white/20 dark:bg-black/70 backdrop-blur-sm"></div>

                                                                    {/* Hero Content - Meticulously Choreographed */}
                                                                    <motion.div
                                                                      variants={containerVariants}
                                                                      initial="hidden"
                                                                      animate="show"
                                                                      className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-center relative z-20 py-12 md:py-0 min-h-[calc(100vh-80px)]"
                                                                    >
                                                                      {/* Main Headline */}
                                                                      <motion.h1
                                                                        variants={textPopReveal}
                                                                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter drop-shadow-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-slate-800 to-indigo-600 dark:from-blue-300 dark:via-white dark:to-purple-300 text-center mb-5"
                                                                        style={{ lineHeight: '1.05' }}
                                                                      >
                                                                        Transform Your Future.<br className="hidden md:inline"/> <span className="text-blue-600 dark:text-blue-400">UK Jobs, Redefined.</span>
                                                                      </motion.h1>

                                                                      {/* Sub-headline */}
                                                                      <motion.p
                                                                        variants={textPopReveal}
                                                                        className="text-base md:text-lg text-slate-700 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed font-normal text-center mb-8"
                                                                      >
                                                                        Your dedicated platform for flexible, high-impact opportunities that accelerate careers and elevate businesses across the UK.
                                                                      </motion.p>

                                                                      {/* Role Toggle */}
                                                                      <motion.div
                                                                        variants={buttonEnter}
                                                                        className="flex p-1 bg-slate-200 dark:bg-gray-800 rounded-full shadow-lg border border-slate-300 dark:border-gray-700 mb-8 relative z-30"
                                                                      >
                                                                        <button
                                                                          onClick={() => setUserRole('student')}
                                                                          className={`px-5 py-2.5 text-base rounded-full font-semibold transition-all duration-300 ${
                                                                            userRole === 'student'
                                                                              ? 'bg-blue-600 text-white shadow-md'
                                                                              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-gray-700'
                                                                          }`}
                                                                        >
                                                                          I'm a Student
                                                                        </button>
                                                                        <button
                                                                          onClick={() => setUserRole('employer')}
                                                                          className={`px-5 py-2.5 text-base rounded-full font-semibold transition-all duration-300 ${
                                                                            userRole === 'employer'
                                                                              ? 'bg-indigo-600 text-white shadow-md'
                                                                              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-gray-700'
                                                                          }`}
                                                                        >
                                                                          I'm an Employer
                                                                        </button>
                                                                      </motion.div>

                                                                      {/* Dynamic Action Section based on Toggle */}
                                                                      <motion.div
                                                                        key={userRole}
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -10 }}
                                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                                        className="w-full max-w-2xl px-4 relative z-30"
                                                                      >
                                                                        {userRole === 'student' ? (
                                                                          // Student Search Bar
                                                                          <form action="/browse-jobs" method="GET" className="flex flex-col sm:flex-row gap-2.5 items-center justify-center">
                                                                            <Input
                                                                              type="search"
                                                                              name="query"
                                                                              placeholder="Search for roles (e.g., 'data analyst', 'marketing', 'part-time')"
                                                                              className="flex-grow h-12 px-4 text-base bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-lg"
                                                                            />
                                                                            <Button type="submit" size="lg" className="h-12 px-7 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden">
                                                                                <div className="flex items-center justify-center w-full h-full relative z-10">
                                                                                    <span>Search Jobs</span> <SearchIcon className="ml-2 h-5 w-5" />
                                                                                    <span className="absolute inset-0 bg-black/20 dark:bg-blue-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                                                                                </div>
                                                                            </Button>
                                                                          </form>
                                                                        ) : (
                                                                          // Employer Post Job Section
                                                                          <form action="/post-job" method="GET" className="flex flex-col sm:flex-row gap-2.5 items-center justify-center">
                                                                            <Input
                                                                              type="text"
                                                                              name="jobTitle"
                                                                              placeholder="Job Title (e.g., 'Marketing Assistant')"
                                                                              className="flex-grow h-12 px-4 text-base bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-lg"
                                                                            />
                                                                            <Button type="submit" size="lg" className="h-12 px-10 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden">
                                                                                <div className="flex items-center justify-center w-full h-full relative z-10">
                                                                                    <span>Post a Job for £1</span> <SearchIcon className="ml-2 h-5 w-5" />
                                                                                    <span className="absolute inset-0 bg-black/20 dark:bg-indigo-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                                                                                </div>
                                                                            </Button>
                                                                          </form>
                                                                        )}
                                                                      </motion.div>
                                                                    </motion.div>

                                                                    {/* Dynamic Scroll Indicator with more bounce */}
                                                                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                                                                      <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1, y: [0, 15, 0] }}
                                                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", times: [0, 0.5, 1] }}
                                                                        className="text-slate-700 dark:text-white"
                                                                      >
                                                                        <ArrowRightIcon className="rotate-90 w-7 h-7" />
                                                                      </motion.div>
                                                                    </div>
                                                                  </section>

                                                                  {mainContent}

                                                                  {/* UK Student Work Compliance - Authoritative & Transparent with Liquid Glassmorphism (This section remains constant) */}
                                                                  <section className="w-full py-20 md:py-28 bg-blue-50 dark:bg-blue-900 text-slate-900 dark:text-white shadow-inset-dark relative z-10 overflow-hidden">
                                                                    {/* Dynamic glowing background circles */}
                                                                    <div className="absolute inset-0 z-0 opacity-15">
                                                                        <div className="absolute -top-1/4 -right-1/4 w-1/3 h-1/3 rounded-full bg-yellow-400 blur-3xl animate-blob-float-6"></div>
                                                                        <div className="absolute bottom-1/4 left-1/4 w-1/3 h-1/3 rounded-full bg-orange-400 blur-3xl animate-blob-float-7"></div>
                                                                    </div>

                                                                    <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl relative z-10">
                                                                      <motion.div
                                                                        initial={{ opacity: 0, y: 20, scale: 0.99 }}
                                                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                                        viewport={{ once: true, amount: 0.3 }}
                                                                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                                                                        className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 px-5 py-2.5 rounded-full text-sm md:text-base font-bold mb-8 shadow-lg animate-pulse-subtle border border-blue-400/20 dark:border-blue-300/20 text-white dark:text-white"
                                                                      >
                                                                        <LandmarkIcon className="h-6 w-6 text-white"/>
                                                                        UK Student Work Regulations
                                                                      </motion.div>
                                                                      <motion.h2
                                                                        initial={{ opacity: 0, y: 20, scale: 0.99 }}
                                                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                                        viewport={{ once: true, amount: 0.3 }}
                                                                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
                                                                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-7 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-lg"
                                                                      >
                                                                        Ensuring Impeccable <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-gray-100">Compliance</span> for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Every Stakeholder.</span>
                                                                      </motion.h2>
                                                                      <motion.p
                                                                        initial={{ opacity: 0, y: 20, scale: 0.99 }}
                                                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                                        viewport={{ once: true, amount: 0.3 }}
                                                                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
                                                                        className="text-base md:text-lg text-blue-900/80 dark:text-blue-100 max-w-2xl mx-auto mb-14 leading-relaxed font-normal">
                                                                        StudentJobs UK is unequivocally committed to the highest standards of UK student visa work hour limits and employment laws. We provide comprehensive, dynamically updated resources and built-in, intelligent safeguards to ensure an entirely transparent, seamless, and impeccably lawful employment journey for all.
                                                                      </motion.p>
                                                                      <div className="flex flex-col sm:flex-row justify-center gap-5 md:gap-10 mb-14 md:mb-20">
                                                                        <motion.div
                                                                          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                                                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                                        
                                                                          transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 80 }}
                                                                          className="bg-white/60 dark:bg-white/10 p-7 rounded-xl shadow-lg backdrop-blur-md border border-white/40 dark:border-white/20 transform hover:scale-102 hover:rotate-0.5 transition-transform duration-300 relative overflow-hidden"
                                                                        >
                                                                            <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slowest z-0"></div>
                                                                          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-center gap-3 relative z-10"><ClockIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-300"/> During Term-Time</h3>
                                                                          <p className="text-2xl md:text-3xl font-extrabold text-yellow-600 dark:text-yellow-300 relative z-10">Max: 20 hours / week</p>
                                                                        </motion.div>
                                                                        <motion.div
                                                                          initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
                                                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                                          transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 80 }}
                                                                          className="bg-white/60 dark:bg-white/10 p-7 rounded-xl shadow-lg backdrop-blur-md border border-white/40 dark:border-white/20 transform hover:scale-102 hover:-rotate-0.5 transition-transform duration-300 relative overflow-hidden">
                                                                            <div className="absolute inset-0 bg-orange-400/10 rounded-full blur-3xl animate-pulse-slowest animation-delay-1s z-0"></div>
                                                                          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-center gap-3 relative z-10"><CalendarIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-300"/> During Holidays</h3>
                                                                          <p className="text-2xl md:text-3xl font-extrabold text-yellow-600 dark:text-yellow-300 relative z-10">Up to: 40 hours / week</p>
                                                                        </motion.div>
                                                                      </div>
                                                                      <motion.div
                                                                        initial={{ opacity: 0, y: 20, scale: 0.99 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.5 }}
                                                                      >
                                                                      <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-none">
                                                                            <Link href="/student-guide#work-hours" className="flex items-center">Explore Full Compliance Details <ArrowRightIcon className="ml-2 h-5 w-5" /></Link>
                                                                        </Button>
                                                                      </motion.div>
                                                                    </div>
                                                                  </section>

                                                                  {/* Final Call to Action - The Apex Conversion Experience */}
                                                                  <section className="w-full py-20 md:py-28 bg-slate-100 dark:bg-gray-950 text-slate-900 dark:text-white relative z-10 overflow-hidden">
                                                                    {/* Generative-like background elements */}
                                                                    <div className="absolute inset-0 z-0 opacity-15">
                                                                      <div className="absolute top-[10%] left-[5%] w-1/4 h-1/4 rounded-full bg-purple-600 blur-3xl animate-blob-float-1 animation-delay-0s"></div>
                                                                      <div className="absolute bottom-[10%] right-[5%] w-1/4 h-1/4 rounded-full bg-blue-600 blur-3xl animate-blob-float-2 animation-delay-1s"></div>
                                                                    </div>

                                                                    <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl relative z-10">
                                                                      <motion.h2
                                                                        initial={{ opacity: 0, y: 20, scale: 0.99 }}
                                                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                                        viewport={{ once: true, amount: 0.3 }}
                                                                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                                                                        className="text-3xl sm:text-4xl py-1 md:text-5xl font-extrabold mb-7 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 drop-shadow-lg"
                                                                      >
                                                                        Ready to Get Started?
                                                                      </motion.h2>
                                                                      <motion.p
                                                                        initial={{ opacity: 0, y: 20, scale: 0.99 }}
                                                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                                        viewport={{ once: true, amount: 0.3 }}
                                                                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
                                                                        className="text-base md:text-lg text-slate-700 dark:text-gray-300 max-w-2xl mx-auto mb-14 md:mb-20 leading-relaxed font-normal">
                                                                        Whether you're a student looking for flexible part-time work or an employer seeking fresh talent, StudentJobs UK is your platform. Join us today.
                                                                      </motion.p>
                                                                      <motion.div
                                                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                                        viewport={{ once: true, amount: 0.3 }}
                                                                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
                                                                        className="flex flex-col sm:flex-row gap-5 md:gap-7 justify-center"
                                                                      >
                                                                        <Button asChild size="xl" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-600 dark:hover:bg-purple-700 dark:text-white font-extrabold py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 ease-out group relative overflow-hidden">
                                                                            <Link href="/browse-jobs" className="flex items-center justify-center w-full h-full relative z-10">
                                                                                <Fragment>
                                                                                    Students: Find a Job <ArrowRightIcon className="ml-3 h-6 w-6 transform group-hover:translate-x-1.5 transition-transform" />
                                                                                </Fragment>
                                                                            </Link>
                                                                        </Button>
                                                                        <Button asChild variant="outline" size="xl" className="h-14 px-8 text-lg bg-white text-purple-700 border-1.5 border-white font-extrabold py-4 rounded-full shadow-xl transform transition-transform duration-300 ease-out hover:scale-105 group relative overflow-hidden dark:bg-white dark:text-purple-700 dark:border-white">
                                                                            <Link href="/post-job" className="flex items-center justify-center w-full h-full relative z-10">
                                                                                <Fragment>
                                                                                    Employers: Post a Job <ArrowRightIcon className="ml-3 h-6 w-6 transform group-hover:translate-x-1.5 transition-transform" />
                                                                                </Fragment>
                                                                            </Link>
                                                                        </Button>
                                                                      </motion.div>
                                                                    </div>
                                                                  </section>
                                                                </div> {/* This closes the new pt-[80px] div */}
                                                              </div>
                                                            );
                                                          }