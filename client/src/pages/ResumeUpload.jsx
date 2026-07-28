import React, { useState, useRef } from "react";
import { FiDownload, FiPlus, FiTrash2, FiUser, FiBook, FiBriefcase, FiCode, FiAward, FiFileText, FiLinkedin, FiGithub, FiZap, FiMail, FiPhone, FiGlobe } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";

const formatText = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i !== text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const formatSkillText = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      return (
        <React.Fragment key={i}>
          <strong>{line.substring(0, colonIndex + 1)}</strong>{line.substring(colonIndex + 1)}
          {i !== text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment key={i}>
        {line}
        {i !== text.split('\n').length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const ResumeBuilder = () => {
  const { user } = useAuth();

  const [resumeData, setResumeData] = useState({
    personal: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      linkedin: "",
      github: "",
      portfolio: "",
      summary: ""
    },
    education: [],
    experience: [],
    projects: [],
    skills: { technical: "", soft: "" },
    certifications: []
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeRef = useRef(null);

  const handlePersonalChange = (e) => {
    setResumeData({
      ...resumeData,
      personal: { ...resumeData.personal, [e.target.name]: e.target.value }
    });
  };

  const handleSkillsChange = (e) => {
    setResumeData({
      ...resumeData,
      skills: { ...resumeData.skills, [e.target.name]: e.target.value }
    });
  };

  const addField = (field, defaultObj) => {
    setResumeData({
      ...resumeData,
      [field]: [...resumeData[field], defaultObj]
    });
  };

  const updateField = (field, index, key, value) => {
    const updated = [...resumeData[field]];
    updated[index][key] = value;
    setResumeData({ ...resumeData, [field]: updated });
  };

  const removeField = (field, index) => {
    const updated = [...resumeData[field]];
    updated.splice(index, 1);
    setResumeData({ ...resumeData, [field]: updated });
  };

  const loadSampleData = () => {
    setResumeData({
      personal: {
        name: "Aarav Patel",
        email: "aarav.patel@example.com",
        phone: "+91 98765 43210",
        linkedin: "linkedin.com/in/aaravpatel",
        github: "github.com/aaravdev",
        portfolio: "aarav.dev",
        summary: "Passionate Full Stack Developer with experience in building scalable web applications using the MERN stack. Strong problem-solving skills and a track record of delivering high-quality code in agile environments."
      },
      education: [
        { degree: "B.Tech in Computer Engineering", college: "DA-IICT, Gandhinagar", year: "2024", gpa: "8.9 CGPA" },
        { degree: "Higher Secondary (Science)", college: "Alpha Vidya Sankul", year: "2020", gpa: "92%" }
      ],
      experience: [
        { role: "Software Engineering Intern", company: "TCS Innovations", duration: "Jan 2024 - Present", description: "• Developed an internal dashboard using React and Redux, improving data visualization speed by 40%.\n• Integrated REST APIs and implemented JWT authentication for secure login.\n• Collaborated with UI/UX team to ensure pixel-perfect responsive designs." },
        { role: "Web Development Intern", company: "WebTech Solutions Pvt Ltd", duration: "May 2023 - July 2023", description: "• Built a fully functional e-commerce frontend using React, TailwindCSS, and Context API.\n• Optimized web vitals scoring 90+ on Lighthouse." }
      ],
      projects: [
        { title: "Placement Portal Platform", techStack: "MERN, TailwindCSS, Vite", link: "github.com/aaravdev/placement", description: "• Built a comprehensive platform bridging students and college administration for placement drives.\n• Implemented complex role-based access control (RBAC) and real-time dashboard analytics." },
        { title: "AI Resume ATS Checker", techStack: "Python, Flask, NLP", link: "github.com/aaravdev/ats-checker", description: "• Created a machine learning model to parse resumes and score them against job descriptions.\n• Used SpaCy for entity extraction and achieved 85% accuracy in matching skills." }
      ],
      skills: {
        technical: "Languages: JavaScript (ES6+), Python, C++\nFrameworks: React.js, Node.js, Express.js, Tailwind\nDatabases: MongoDB, PostgreSQL\nTools: Git, Docker, Postman",
        soft: "Agile Development, Team Leadership, Effective Communication, Problem Solving"
      },
      certifications: [
        { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", year: "2023", link: "aws.amazon.com/certification" },
        { title: "Meta Front-End Developer", issuer: "Coursera", year: "2022", link: "coursera.org" }
      ]
    });
  };

  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      // Capture the full content without constraining height
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Scale to fit on a single A4 page
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      if (imgHeight > pdfPageHeight) {
        const scaleFactor = pdfPageHeight / imgHeight;
        finalWidth = imgWidth * scaleFactor;
        finalHeight = pdfPageHeight;
      }
      const xOffset = (pdfWidth - finalWidth) / 2;

      pdf.addImage(imgData, "PNG", xOffset, 0, finalWidth, finalHeight);

      // Add clickable link annotations over the image
      const links = element.querySelectorAll('a[href]');
      const elRect = element.getBoundingClientRect();

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const linkRect = link.getBoundingClientRect();
        const relX = (linkRect.left - elRect.left) / elRect.width;
        const relY = (linkRect.top - elRect.top) / elRect.height;
        const relW = linkRect.width / elRect.width;
        const relH = linkRect.height / elRect.height;

        const pdfX = xOffset + relX * finalWidth;
        const pdfY = relY * finalHeight;
        const pdfW = relW * finalWidth;
        const pdfH = relH * finalHeight;

        const fullUrl = href.startsWith('http') || href.startsWith('mailto') ? href : `https://${href}`;
        pdf.link(pdfX, pdfY, pdfW, pdfH, { url: fullUrl });
      });

      pdf.save(`${resumeData.personal.name || 'Student'}_Resume.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatUrl = (url, type) => {
    if (!url) return "";
    let cleanUrl = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    if (type === 'linkedin') cleanUrl = cleanUrl.replace('linkedin.com/in/', '');
    if (type === 'github') cleanUrl = cleanUrl.replace('github.com/', '');
    return cleanUrl;
  };

  const getValidUrl = (url) => {
    if (!url) return "#";
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // -------------------------------------------------------------
  // TEMPLATES
  // -------------------------------------------------------------

  const renderTemplate = () => {
    const data = resumeData;

    // -------------------------------------------------------------
    // 1. MINIMALIST (Clean, airy, Notion-like elegance)
    // -------------------------------------------------------------
    if (template === "minimalist") {
      return (
        <div className="bg-white p-10" ref={resumeRef} style={{ minHeight: "297mm", fontFamily: "'Inter', sans-serif", color: "#1a1a1a" }}>
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">{data.personal.name || "Your Name"}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-500 font-medium">
              {data.personal.email && (
                <a href={`mailto:${data.personal.email}`} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                  <FiMail size={12} /> {data.personal.email}
                </a>
              )}
              {data.personal.phone && <span className="flex items-center gap-1"><FiPhone size={12} /> {data.personal.phone}</span>}
              {data.personal.linkedin && (
                <a href={getValidUrl(data.personal.linkedin)} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                  <FiLinkedin size={12} /> {formatUrl(data.personal.linkedin, 'linkedin')}
                </a>
              )}
              {data.personal.github && (
                <a href={getValidUrl(data.personal.github)} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                  <FiGithub size={12} /> {formatUrl(data.personal.github, 'github')}
                </a>
              )}
              {data.personal.portfolio && (
                <a href={getValidUrl(data.personal.portfolio)} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                  <FiGlobe size={12} /> {formatUrl(data.personal.portfolio, 'portfolio')}
                </a>
              )}
            </div>
          </header>

          <div className="space-y-7">
            {data.personal.summary && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Profile</h2>
                <p className="text-[13px] leading-relaxed text-slate-700">{data.personal.summary}</p>
              </section>
            )}

            {data.experience.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Experience</h2>
                <div className="space-y-5">
                  {data.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-[14px]">{exp.role}</h3>
                        <span className="text-[12px] font-medium text-slate-400">{exp.duration}</span>
                      </div>
                      <div className="text-[13px] font-medium text-slate-600 mb-2">{exp.company}</div>
                      <p className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.projects.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Projects</h2>
                <div className="space-y-5">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-[14px]">
                          {proj.link ? <a href={getValidUrl(proj.link)} target="_blank" rel="noreferrer" className="hover:underline">{proj.title}</a> : proj.title}
                        </h3>
                        {proj.techStack && <span className="text-[11px] font-semibold text-slate-400">{proj.techStack}</span>}
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-8">
              {data.education.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Education</h2>
                  <div className="space-y-4">
                    {data.education.map((edu, i) => (
                      <div key={i}>
                        <h3 className="font-bold text-slate-900 text-[13px]">{edu.degree}</h3>
                        <div className="text-[13px] text-slate-600 mt-0.5">{edu.college}</div>
                        <div className="text-[12px] text-slate-400 mt-0.5 flex gap-3">
                          <span>{edu.year}</span>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(data.skills.technical || data.skills.soft || data.certifications.length > 0) && (
                <section className="space-y-6">
                  {(data.skills.technical || data.skills.soft) && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Skills</h2>
                      {data.skills.technical && (
                        <div className="mb-3 text-[13px]">
                          <strong className="block text-slate-900 mb-1">Technical</strong>
                          <div className="text-slate-700">{formatSkillText(data.skills.technical)}</div>
                        </div>
                      )}
                      {data.skills.soft && (
                        <div className="text-[13px]">
                          <strong className="block text-slate-900 mb-1">Soft Skills</strong>
                          <div className="text-slate-700">{data.skills.soft}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {data.certifications.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Certifications</h2>
                      <div className="space-y-2">
                        {data.certifications.map((cert, i) => (
                          <div key={i} className="text-[13px]">
                            <strong className="text-slate-900 block">
                              {cert.link ? <a href={getValidUrl(cert.link)} target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-600 transition-colors">{cert.title}</a> : cert.title}
                            </strong>
                            <span className="text-slate-500">{cert.issuer} • {cert.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------
    // 2. MODERN (Sleek 2-column, sophisticated accents, no heavy backgrounds)
    // -------------------------------------------------------------
    if (template === "modern") {
      return (
        <div className="bg-white flex" ref={resumeRef} style={{ minHeight: "297mm", fontFamily: "'Outfit', sans-serif" }}>
          {/* Left Column - 35% */}
          <div className="w-[35%] bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-8">
            <div>
              <div className="w-12 h-1 bg-indigo-600 mb-4"></div>
              <h1 className="text-3xl font-black text-slate-900 leading-none mb-1 tracking-tight">{data.personal.name || "Your Name"}</h1>
            </div>

            <div className="space-y-3 text-[13px] text-slate-600 font-medium">
              {data.personal.email && (
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><FiMail size={12}/></div> <span className="break-all">{data.personal.email}</span></div>
              )}
              {data.personal.phone && (
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><FiPhone size={12}/></div> {data.personal.phone}</div>
              )}
              {data.personal.linkedin && (
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><FiLinkedin size={12}/></div> <span className="break-all">{formatUrl(data.personal.linkedin, 'linkedin')}</span></div>
              )}
              {data.personal.github && (
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><FiGithub size={12}/></div> <span className="break-all">{formatUrl(data.personal.github, 'github')}</span></div>
              )}
            </div>

            {data.education.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiBook className="text-indigo-600" /> Education
                </h3>
                <div className="space-y-4">
                  {data.education.map((edu, i) => (
                    <div key={i} className="relative pl-4 border-l-2 border-indigo-200">
                      <div className="absolute w-2 h-2 rounded-full bg-indigo-600 -left-[5px] top-1.5"></div>
                      <div className="font-bold text-slate-900 text-[13px]">{edu.degree}</div>
                      <div className="text-slate-600 text-[12px] font-medium mt-0.5">{edu.college}</div>
                      <div className="text-indigo-600 text-[11px] font-bold mt-1 tracking-wider">{edu.year} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(data.skills.technical || data.skills.soft) && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiAward className="text-indigo-600" /> Technical Skills
                </h3>
                {data.skills.technical && (
                  <div className="mb-4 space-y-3.5">
                    {data.skills.technical.split('\n').map((line, idx) => {
                      if (!line.trim()) return null;
                      const colonIndex = line.indexOf(':');
                      if (colonIndex > -1) {
                        const category = line.substring(0, colonIndex).trim();
                        const items = line.substring(colonIndex + 1).split(',');
                        return (
                          <div key={idx}>
                            <strong className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">{category}</strong>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((item, i) => {
                                const s = item.trim();
                                if(!s) return null;
                                return <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-semibold">{s}</span>
                              })}
                            </div>
                          </div>
                        );
                      }
                      // fallback if no colon
                      return (
                        <div key={idx} className="flex flex-wrap gap-1.5">
                          {line.split(/[,\n]+/).map((item, i) => {
                             const s = item.trim();
                             if(!s) return null;
                             return <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-semibold">{s}</span>
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
                {data.skills.soft && (
                  <div>
                    <strong className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">Soft Skills</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.soft.split(/[,\n]+/).map((skill, idx) => {
                        const s = skill.trim();
                        if (!s) return null;
                        return <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded text-[11px] font-semibold">{s}</span>
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - 65% */}
          <div className="w-[65%] p-8 pt-10">
            {data.personal.summary && (
              <div className="mb-8">
                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{data.personal.summary}</p>
              </div>
            )}

            {data.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div> Experience
                </h2>
                <div className="space-y-6">
                  {data.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[15px]">{exp.role}</h4>
                          <div className="text-[13px] font-semibold text-indigo-600 mt-0.5">{exp.company}</div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{exp.duration}</span>
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed mt-2 whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.projects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> Projects
                </h2>
                <div className="space-y-6">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 text-[15px]">
                          {proj.link ? <a href={getValidUrl(proj.link)} className="hover:text-emerald-600 transition-colors">{proj.title}</a> : proj.title}
                        </h4>
                        {proj.techStack && <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">{proj.techStack}</span>}
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed mt-1.5 whitespace-pre-wrap">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div> Certifications
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {data.certifications.map((cert, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="font-bold text-slate-900 text-[13px] mb-0.5">
                        {cert.link ? <a href={getValidUrl(cert.link)} target="_blank" rel="noreferrer" className="hover:text-amber-600 hover:underline transition-colors">{cert.title}</a> : cert.title}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 flex justify-between">
                        <span>{cert.issuer}</span>
                        <span>{cert.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------
    // 3. PROFESSIONAL (Classic Ivy League / Wall Street format)
    // -------------------------------------------------------------
    return (
      <div className="bg-white p-12" ref={resumeRef} style={{ minHeight: "297mm", fontFamily: "'Times New Roman', Times, serif", color: "#000" }}>
        <div className="text-center mb-4">
          <h1 className="text-3xl font-normal mb-1">{data.personal.name || "Your Name"}</h1>
          <div className="text-[12px] flex justify-center items-center flex-wrap mt-1">
            {data.personal.email && (
              <span className="flex items-center gap-1">
                <FiMail size={11} />
                <a href={`mailto:${data.personal.email}`} className="hover:underline">{data.personal.email}</a>
              </span>
            )}
            {data.personal.phone && (
              <span className="flex items-center gap-1 before:content-['|'] before:mx-2 before:text-gray-400">
                <FiPhone size={11} />
                {data.personal.phone}
              </span>
            )}
            {data.personal.linkedin && (
              <span className="flex items-center gap-1 before:content-['|'] before:mx-2 before:text-gray-400">
                <FiLinkedin size={11} />
                <a href={getValidUrl(data.personal.linkedin)} className="hover:underline">{formatUrl(data.personal.linkedin, 'linkedin')}</a>
              </span>
            )}
            {data.personal.github && (
              <span className="flex items-center gap-1 before:content-['|'] before:mx-2 before:text-gray-400">
                <FiGithub size={11} />
                <a href={getValidUrl(data.personal.github)} className="hover:underline">{formatUrl(data.personal.github, 'github')}</a>
              </span>
            )}
            {data.personal.portfolio && (
              <span className="flex items-center gap-1 before:content-['|'] before:mx-2 before:text-gray-400">
                <FiGlobe size={11} />
                <a href={getValidUrl(data.personal.portfolio)} className="hover:underline">{formatUrl(data.personal.portfolio, 'portfolio')}</a>
              </span>
            )}
          </div>
        </div>

        {data.personal.summary && (
          <div className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider border-b-[1.5px] border-black pb-0.5 mb-2">Summary</h2>
            <p className="text-[12px] leading-relaxed text-justify">{data.personal.summary}</p>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider border-b-[1.5px] border-black pb-0.5 mb-2">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <strong className="text-[13px]">{edu.college}</strong>
                  <span className="text-[12px]">{edu.year}</span>
                </div>
                <div className="flex justify-between items-baseline mt-0.5">
                  <span className="text-[12px] italic">{edu.degree}</span>
                  {edu.gpa && <span className="text-[12px]">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider border-b-[1.5px] border-black pb-0.5 mb-2">Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <strong className="text-[13px]">{exp.company}</strong>
                  <span className="text-[12px]">{exp.duration}</span>
                </div>
                <div className="text-[12px] italic mt-0.5 mb-1">{exp.role}</div>
                <div className="text-[12px] leading-relaxed text-justify whitespace-pre-wrap ml-3">{exp.description}</div>
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider border-b-[1.5px] border-black pb-0.5 mb-2">Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <strong className="text-[13px]">
                    {proj.title} {proj.link && <span className="font-normal italic">| <a href={getValidUrl(proj.link)} className="hover:underline">{formatUrl(proj.link, 'github')}</a></span>}
                  </strong>
                  {proj.techStack && <span className="text-[11px]">{proj.techStack}</span>}
                </div>
                <div className="text-[12px] leading-relaxed text-justify whitespace-pre-wrap ml-3">{proj.description}</div>
              </div>
            ))}
          </div>
        )}

        {(data.skills.technical || data.skills.soft) && (
          <div className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider border-b-[1.5px] border-black pb-0.5 mb-2">Skills & Certifications</h2>
            <div className="text-[12px] space-y-1">
              {data.skills.technical && (
                <div><strong>Technical: </strong> {data.skills.technical}</div>
              )}
              {data.skills.soft && (
                <div><strong>Soft Skills: </strong> {data.skills.soft}</div>
              )}
              {data.certifications.length > 0 && (
                <div>
                  <strong>Certifications: </strong>
                  {data.certifications.map((c, i) => (
                    <React.Fragment key={i}>
                      {c.link ? <a href={getValidUrl(c.link)} target="_blank" rel="noreferrer" className="hover:underline">{c.title}</a> : c.title}
                      {` (${c.issuer})${i !== data.certifications.length - 1 ? ', ' : ''}`}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // RENDER IMMERSIVE WORKSPACE
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-surface overflow-hidden animate-fade-in">
      
      {/* STICKY GLASSMORPHISM HEADER */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 bg-paper/80 backdrop-blur-xl border-b border-line z-10">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiFileText size={20} /></div>
            Resume Workspace
          </h1>
          <p className="font-body text-muted text-sm mt-1">Design, edit, and export your ATS-friendly resume.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-paper-raised p-1 rounded-xl border border-line">
            {["modern", "minimalist", "professional"].map(tmp => (
              <button 
                key={tmp}
                onClick={() => setTemplate(tmp)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${template === tmp ? 'bg-white shadow-sm text-ink ring-1 ring-line' : 'text-muted hover:text-ink hover:bg-slate-50'}`}
              >
                {tmp}
              </button>
            ))}
          </div>

          <button
            onClick={loadSampleData}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-deep border border-amber/20 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
          >
            <FiZap /> Demo Data
          </button>
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-ink hover:bg-ink-soft text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 shadow-lg shadow-ink/10"
          >
            <FiDownload /> {isGenerating ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: EDITOR */}
        <div className="w-[450px] shrink-0 bg-paper border-r border-line flex flex-col z-10 shadow-2xl shadow-ink/5">
          {/* Editor Tabs (Vertical or segmented) */}
          <div className="flex overflow-x-auto p-3 bg-paper-raised border-b border-line gap-2 shrink-0 custom-scrollbar">
            {[
              { id: "personal", icon: FiUser, label: "Info" },
              { id: "education", icon: FiBook, label: "Edu" },
              { id: "experience", icon: FiBriefcase, label: "Exp" },
              { id: "projects", icon: FiCode, label: "Projects" },
              { id: "skills", icon: FiAward, label: "Skills" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-xl min-w-[80px] transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink hover:bg-white/50'}`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-muted'} />
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-paper">
            
            {/* PERSONAL INFO */}
            {activeTab === "personal" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-soft uppercase mb-2 tracking-widest">Full Name</label>
                    <input type="text" name="name" value={resumeData.personal.name} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-ink text-sm font-medium" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-soft uppercase mb-2 tracking-widest">Email</label>
                    <input type="email" name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-ink text-sm font-medium" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-soft uppercase mb-2 tracking-widest">Phone</label>
                    <input type="text" name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-ink text-sm font-medium" placeholder="+91 98765 43210" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-soft uppercase mb-2 tracking-widest">LinkedIn</label>
                      <input type="text" name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-ink text-sm font-medium" placeholder="in/johndoe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-soft uppercase mb-2 tracking-widest">GitHub</label>
                      <input type="text" name="github" value={resumeData.personal.github} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-ink text-sm font-medium" placeholder="github/johndoe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-soft uppercase mb-2 tracking-widest">Portfolio / Website</label>
                    <input type="text" name="portfolio" value={resumeData.personal.portfolio} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-ink text-sm font-medium" placeholder="johndoe.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-soft uppercase mb-2 tracking-widest">Professional Summary</label>
                    <textarea name="summary" value={resumeData.personal.summary} onChange={handlePersonalChange} rows="5" className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-ink text-sm font-medium resize-none custom-scrollbar" placeholder="Passionate software engineering student with experience in React and Node.js..."></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {activeTab === "education" && (
              <div className="animate-fade-in space-y-4">
                {resumeData.education.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-line rounded-2xl bg-paper-raised/50">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4"><FiBook size={28} /></div>
                    <p className="text-ink font-semibold mb-1">No Education Added</p>
                    <p className="text-muted text-sm text-center mb-6">Add your degrees and schools to build your profile.</p>
                    <button onClick={() => addField("education", { degree: "", college: "", year: "", gpa: "" })} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <FiPlus /> Add Education
                    </button>
                  </div>
                ) : (
                  <>
                    {resumeData.education.map((edu, i) => (
                      <div key={i} className="p-5 border border-line rounded-2xl bg-paper shadow-sm relative group hover:border-indigo-200 transition-colors">
                        <button onClick={() => removeField("education", i)} className="absolute top-4 right-4 p-2 text-muted hover:text-coral hover:bg-coral/10 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                        <div className="space-y-4 pr-10">
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Degree / Course</label>
                            <input type="text" value={edu.degree} onChange={e => updateField("education", i, "degree", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-indigo-400 font-medium" placeholder="B.Tech Computer Science" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">University / College</label>
                            <input type="text" value={edu.college} onChange={e => updateField("education", i, "college", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-indigo-400 font-medium" placeholder="ABC University" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Year</label>
                              <input type="text" value={edu.year} onChange={e => updateField("education", i, "year", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-indigo-400 font-medium" placeholder="2024" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">CGPA / %</label>
                              <input type="text" value={edu.gpa} onChange={e => updateField("education", i, "gpa", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-indigo-400 font-medium" placeholder="8.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addField("education", { degree: "", college: "", year: "", gpa: "" })} className="w-full py-3 border-2 border-dashed border-line text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                      <FiPlus /> Add Another
                    </button>
                  </>
                )}
              </div>
            )}

            {/* EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="animate-fade-in space-y-4">
                {resumeData.experience.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-line rounded-2xl bg-paper-raised/50">
                    <div className="w-16 h-16 bg-amber/10 text-amber-deep rounded-full flex items-center justify-center mb-4"><FiBriefcase size={28} /></div>
                    <p className="text-ink font-semibold mb-1">No Experience Added</p>
                    <p className="text-muted text-sm text-center mb-6">List your past internships or full-time roles here.</p>
                    <button onClick={() => addField("experience", { role: "", company: "", duration: "", description: "" })} className="px-5 py-2.5 bg-amber-deep text-white rounded-xl font-semibold shadow-md hover:bg-amber transition-colors flex items-center gap-2">
                      <FiPlus /> Add Experience
                    </button>
                  </div>
                ) : (
                  <>
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="p-5 border border-line rounded-2xl bg-paper shadow-sm relative group hover:border-amber-300 transition-colors">
                        <button onClick={() => removeField("experience", i)} className="absolute top-4 right-4 p-2 text-muted hover:text-coral hover:bg-coral/10 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                        <div className="space-y-4 pr-10">
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Job Role</label>
                            <input type="text" value={exp.role} onChange={e => updateField("experience", i, "role", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-amber font-medium" placeholder="Software Engineer Intern" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Company</label>
                              <input type="text" value={exp.company} onChange={e => updateField("experience", i, "company", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-amber font-medium" placeholder="Google" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Duration</label>
                              <input type="text" value={exp.duration} onChange={e => updateField("experience", i, "duration", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-amber font-medium" placeholder="Jan 2023 - Present" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Description (Bullets)</label>
                            <textarea value={exp.description} onChange={e => updateField("experience", i, "description", e.target.value)} rows="4" className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-amber font-medium custom-scrollbar resize-none" placeholder="• Developed a new feature using React..."></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addField("experience", { role: "", company: "", duration: "", description: "" })} className="w-full py-3 border-2 border-dashed border-line text-amber-deep rounded-xl font-bold hover:bg-amber/10 transition-colors flex items-center justify-center gap-2">
                      <FiPlus /> Add Another
                    </button>
                  </>
                )}
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <div className="animate-fade-in space-y-4">
                {resumeData.projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-line rounded-2xl bg-paper-raised/50">
                    <div className="w-16 h-16 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mb-4"><FiCode size={28} /></div>
                    <p className="text-ink font-semibold mb-1">No Projects Added</p>
                    <p className="text-muted text-sm text-center mb-6">Showcase your best development work.</p>
                    <button onClick={() => addField("projects", { title: "", techStack: "", link: "", description: "" })} className="px-5 py-2.5 bg-emerald text-white rounded-xl font-semibold shadow-md hover:bg-emerald-soft transition-colors flex items-center gap-2">
                      <FiPlus /> Add Project
                    </button>
                  </div>
                ) : (
                  <>
                    {resumeData.projects.map((proj, i) => (
                      <div key={i} className="p-5 border border-line rounded-2xl bg-paper shadow-sm relative group hover:border-emerald/50 transition-colors">
                        <button onClick={() => removeField("projects", i)} className="absolute top-4 right-4 p-2 text-muted hover:text-coral hover:bg-coral/10 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                        <div className="space-y-4 pr-10">
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Project Title</label>
                            <input type="text" value={proj.title} onChange={e => updateField("projects", i, "title", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-emerald font-medium" placeholder="E-commerce Platform" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Tech Stack</label>
                            <input type="text" value={proj.techStack} onChange={e => updateField("projects", i, "techStack", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-emerald font-medium" placeholder="MERN, Tailwind" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Link</label>
                            <input type="text" value={proj.link} onChange={e => updateField("projects", i, "link", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-emerald font-medium" placeholder="github.com/project" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1.5 tracking-wider">Description (Bullets)</label>
                            <textarea value={proj.description} onChange={e => updateField("projects", i, "description", e.target.value)} rows="4" className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-emerald font-medium custom-scrollbar resize-none" placeholder="• Built a full-stack platform..."></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addField("projects", { title: "", techStack: "", link: "", description: "" })} className="w-full py-3 border-2 border-dashed border-line text-emerald rounded-xl font-bold hover:bg-emerald/10 transition-colors flex items-center justify-center gap-2">
                      <FiPlus /> Add Another
                    </button>
                  </>
                )}
              </div>
            )}

            {/* SKILLS */}
            {activeTab === "skills" && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-ink mb-1">Skills & Certifications</h3>
                  <p className="text-sm text-muted mb-6">List your technical competencies and soft skills.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-ink-soft uppercase mb-2 tracking-wider flex items-center gap-2"><FiCode /> Technical Skills</label>
                      <textarea name="technical" value={resumeData.skills.technical} onChange={handleSkillsChange} rows="5" className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium resize-none custom-scrollbar" placeholder="Languages: JavaScript, Python...&#10;Frameworks: React, Node..."></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-ink-soft uppercase mb-2 tracking-wider flex items-center gap-2"><FiAward /> Soft Skills</label>
                      <textarea name="soft" value={resumeData.skills.soft} onChange={handleSkillsChange} rows="3" className="w-full px-4 py-3 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium resize-none custom-scrollbar" placeholder="Leadership, Communication, Agile..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-line">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-[10px] font-bold text-ink-soft uppercase tracking-wider">Certifications</label>
                    <button onClick={() => addField("certifications", { title: "", issuer: "", year: "", link: "" })} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><FiPlus /> Add</button>
                  </div>
                  
                  <div className="space-y-3">
                    {resumeData.certifications.map((cert, i) => (
                      <div key={i} className="p-4 border border-line rounded-xl bg-paper shadow-sm relative group hover:border-indigo-200">
                        <button onClick={() => removeField("certifications", i)} className="absolute top-3 right-3 p-1.5 text-muted hover:text-coral hover:bg-coral/10 rounded-lg"><FiTrash2 size={14} /></button>
                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div className="col-span-2">
                            <input type="text" value={cert.title} onChange={e => updateField("certifications", i, "title", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-indigo-400 font-medium" placeholder="AWS Cloud Practitioner" />
                          </div>
                          <div>
                            <input type="text" value={cert.issuer} onChange={e => updateField("certifications", i, "issuer", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-indigo-400 font-medium" placeholder="Amazon" />
                          </div>
                          <div>
                            <input type="text" value={cert.year} onChange={e => updateField("certifications", i, "year", e.target.value)} className="w-full px-3 py-2 text-sm bg-paper-raised border border-line rounded-lg focus:outline-none focus:border-indigo-400 font-medium" placeholder="2023" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {resumeData.certifications.length === 0 && <p className="text-sm text-muted italic py-2">No certifications added.</p>}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW CANVAS */}
        <div className="flex-1 bg-surface-hover overflow-y-auto custom-scrollbar flex items-start justify-center p-8 lg:p-12">
          {/* This wrapper gives the illusion of a floating piece of paper */}
          <div className="relative shadow-2xl shadow-ink/20 w-full max-w-[794px] transition-all duration-300 origin-top bg-white border border-line rounded-sm" style={{ minHeight: "1123px" }}>
            {renderTemplate()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeBuilder;
