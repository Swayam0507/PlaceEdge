import React, { useState, useRef } from "react";
import { FiDownload, FiPlus, FiTrash2, FiUser, FiBook, FiBriefcase, FiCode, FiAward, FiFileText, FiLinkedin, FiGithub, FiZap, FiMail } from "react-icons/fi";
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

    if (template === "minimalist") {
      return (
        <div className="bg-white p-8" ref={resumeRef} style={{ minHeight: "297mm", fontFamily: "Inter, sans-serif" }}>
          <div className="text-center pb-4 border-b-2 border-slate-800">
            <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">{data.personal.name || "Your Name"}</h1>
            <div className="mt-2 text-sm text-slate-600 text-center" style={{ lineHeight: '1.8' }}>
              {data.personal.email && (
                <span style={{ marginRight: '10px' }}>
                  <a href={`mailto:${data.personal.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <FiMail size={13} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '4px' }} />{data.personal.email}
                  </a>
                </span>
              )}
              {data.personal.phone && <span style={{ marginRight: '10px' }}>• {data.personal.phone}</span>}
              {data.personal.linkedin && (
                <span style={{ marginRight: '10px' }}>
                  • <a href={getValidUrl(data.personal.linkedin)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '4px' }}>
                    <FiLinkedin size={13} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '4px' }} />{formatUrl(data.personal.linkedin, 'linkedin')}
                  </a>
                </span>
              )}
              {data.personal.github && (
                <span>
                  • <a href={getValidUrl(data.personal.github)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '4px' }}>
                    <FiGithub size={13} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '4px' }} />{formatUrl(data.personal.github, 'github')}
                  </a>
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 space-y-5">
            {data.personal.summary && (
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">{data.personal.summary}</p>
              </div>
            )}

            {data.education.length > 0 && (
              <div>
                <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-2 text-slate-800">Education</h2>
                {data.education.map((edu, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between font-semibold text-slate-900 text-sm">
                      <span>{edu.degree}</span>
                      <span>{edu.year}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>{edu.college}</span>
                      <span>{edu.gpa ? `CGPA: ${edu.gpa}` : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(data.skills.technical || data.skills.soft) && (
              <div>
                <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-2 text-slate-800">Skills</h2>
                {data.skills.technical && (
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Technical: </span> {data.skills.technical}
                  </div>
                )}
                {data.skills.soft && (
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold text-slate-900">Soft Skills: </span> {data.skills.soft}
                  </div>
                )}
              </div>
            )}

            {data.experience.length > 0 && (
              <div>
                <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-2 text-slate-800">Experience</h2>
                {data.experience.map((exp, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between font-semibold text-slate-900 text-sm">
                      <span>{exp.role}</span>
                      <span>{exp.duration}</span>
                    </div>
                    <div className="text-sm text-slate-700 font-medium mb-1">{exp.company}</div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {data.projects.length > 0 && (
              <div>
                <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-2 text-slate-800">Projects</h2>
                {data.projects.map((proj, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <span className="font-semibold text-slate-900 text-sm flex-1">
                        {proj.link ? <a href={getValidUrl(proj.link)} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">{proj.title}</a> : proj.title}
                      </span>
                      {proj.techStack && <span className="text-xs text-slate-600 font-medium shrink-0 text-right">{proj.techStack}</span>}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-2 text-slate-800">Certifications</h2>
                {data.certifications.map((cert, i) => (
                  <div key={i} className="mb-1 text-sm text-slate-700 flex justify-between">
                    <span className="font-medium text-slate-900">
                      {cert.link ? <a href={getValidUrl(cert.link)} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">{cert.title}</a> : cert.title}
                      <span className="font-normal text-slate-500 ml-1">by {cert.issuer}</span>
                    </span>
                    <span>{cert.year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (template === "modern") {
      return (
        <div className="flex bg-white" ref={resumeRef} style={{ minHeight: "297mm", fontFamily: "Inter, sans-serif" }}>
          {/* Left Sidebar */}
          <div className="w-[35%] bg-indigo-900 text-white p-6">
            <h1 className="text-2xl font-bold leading-tight mb-2 uppercase tracking-wide">{data.personal.name || "Your Name"}</h1>

            <div className="mt-6 mb-8 text-indigo-100 text-xs space-y-4">
              {data.personal.email && <div><strong className="block text-white mb-0.5 uppercase tracking-wider text-[10px]">Email</strong><a href={`mailto:${data.personal.email}`} style={{ color: 'inherit', textDecoration: 'none' }}><FiMail size={12} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '6px' }} />{data.personal.email}</a></div>}
              {data.personal.phone && <div><strong className="block text-white mb-0.5 uppercase tracking-wider text-[10px]">Phone</strong>{data.personal.phone}</div>}
              {data.personal.linkedin && <div><strong className="block text-white mb-0.5 uppercase tracking-wider text-[10px]">LinkedIn</strong><a href={getValidUrl(data.personal.linkedin)} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}><FiLinkedin size={12} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '6px' }} />{formatUrl(data.personal.linkedin, 'linkedin')}</a></div>}
              {data.personal.github && <div><strong className="block text-white mb-0.5 uppercase tracking-wider text-[10px]">GitHub</strong><a href={getValidUrl(data.personal.github)} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}><FiGithub size={12} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '6px' }} />{formatUrl(data.personal.github, 'github')}</a></div>}
              {data.personal.portfolio && <div><strong className="block text-white mb-0.5 uppercase tracking-wider text-[10px]">Portfolio</strong>{data.personal.portfolio}</div>}
            </div>

            {(data.skills.technical || data.skills.soft) && (
              <div className="mb-6">
                <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-indigo-700 pb-1 mb-3 text-indigo-300">Skills</h3>
                {data.skills.technical && <div className="text-xs text-white whitespace-pre-wrap leading-relaxed">{data.skills.technical}</div>}
                {data.skills.soft && <div className="mt-3 text-xs text-white whitespace-pre-wrap leading-relaxed">{data.skills.soft}</div>}
              </div>
            )}

            {data.education.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-indigo-700 pb-1 mb-3 text-indigo-300">Education</h3>
                {data.education.map((edu, i) => (
                  <div key={i} className="mb-4 text-xs">
                    <div className="font-bold text-white text-[13px]">{edu.degree}</div>
                    <div className="text-indigo-200 mt-1">{edu.college}</div>
                    <div className="text-indigo-300 mt-1 flex justify-between">
                      <span>{edu.year}</span>
                      <span>{edu.gpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Main Content */}
          <div className="w-[65%] p-8 bg-white">
            {data.personal.summary && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-900 border-b-2 border-indigo-100 pb-1 mb-3">Profile</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.personal.summary}</p>
              </div>
            )}

            {data.experience.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-900 border-b-2 border-indigo-100 pb-1 mb-3">Experience</h2>
                {data.experience.map((exp, i) => (
                  <div key={i} className="mb-5">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{exp.role}</h4>
                      <span className="text-xs text-indigo-600 font-semibold">{exp.duration}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-700 mb-2">{exp.company}</div>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {data.projects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-900 border-b-2 border-indigo-100 pb-1 mb-3">Projects</h2>
                {data.projects.map((proj, i) => (
                  <div key={i} className="mb-5">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight flex-1">
                        {proj.link ? <a href={getValidUrl(proj.link)} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">{proj.title}</a> : proj.title}
                      </h4>
                      {proj.techStack && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold uppercase tracking-wider text-right shrink-0">{proj.techStack}</span>}
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-900 border-b-2 border-indigo-100 pb-1 mb-3">Certifications</h2>
                {data.certifications.map((cert, i) => (
                  <div key={i} className="mb-2 flex justify-between items-center text-sm">
                    <div>
                      <strong className="text-slate-900">
                        {cert.link ? <a href={getValidUrl(cert.link)} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">{cert.title}</a> : cert.title}
                      </strong>
                      <span className="text-slate-400 mx-2">|</span>
                      <span className="text-slate-600">{cert.issuer}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">{cert.year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Professional Template (Serif)
    return (
      <div className="bg-white p-10" ref={resumeRef} style={{ minHeight: "297mm", fontFamily: "'Times New Roman', Times, serif" }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-wide">{data.personal.name || "Your Name"}</h1>
          <p className="text-sm text-slate-700 text-center" style={{ lineHeight: '2' }}>
            {data.personal.email && (
              <span style={{ marginRight: '12px' }}>
                <a href={`mailto:${data.personal.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <FiMail size={14} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '5px' }} />{data.personal.email}
                </a>
              </span>
            )}
            {data.personal.phone && <span style={{ marginRight: '15px' }}>| {data.personal.phone}</span>}
            {data.personal.linkedin && (
              <span style={{ marginRight: '12px' }}>
                | <a href={getValidUrl(data.personal.linkedin)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '4px' }}>
                  <FiLinkedin size={14} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '5px' }} />{formatUrl(data.personal.linkedin, 'linkedin')}
                </a>
              </span>
            )}
            {data.personal.github && (
              <span>
                | <a href={getValidUrl(data.personal.github)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '4px' }}>
                  <FiGithub size={14} style={{ display: 'inline-block', position: 'relative', top: '2px', marginRight: '5px' }} />{formatUrl(data.personal.github, 'github')}
                </a>
              </span>
            )}
          </p>
        </div>

        {data.personal.summary && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-800 pb-1 mb-2 tracking-widest">Professional Summary</h2>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{formatText(data.personal.summary)}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-800 pb-1 mb-3 tracking-widest">Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>{exp.role}</span>
                  <span>{exp.duration}</span>
                </div>
                <div className="italic text-slate-700 text-sm mb-2">{exp.company}</div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pl-4 border-l border-slate-300">{formatText(exp.description)}</p>
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-800 pb-1 mb-3 tracking-widest">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3 flex justify-between text-sm">
                <div>
                  <strong className="block text-slate-900">{edu.degree}</strong>
                  <span className="text-slate-700">{edu.college}</span>
                </div>
                <div className="text-right">
                  <strong className="block text-slate-900">{edu.year}</strong>
                  <span className="text-slate-600">GPA: {edu.gpa}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-800 pb-1 mb-3 tracking-widest">Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <strong className="text-slate-900 text-sm leading-tight flex-1">
                    {proj.link ? <a href={getValidUrl(proj.link)} target="_blank" rel="noreferrer" className="hover:text-slate-600 hover:underline">{proj.title}</a> : proj.title}
                  </strong>
                  {proj.techStack && <span className="text-xs text-slate-600 font-sans shrink-0 text-right">{proj.techStack}</span>}
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{formatText(proj.description)}</p>
              </div>
            ))}
          </div>
        )}

        {(data.skills.technical || data.skills.soft) && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-800 pb-1 mb-3 tracking-widest">Skills</h2>
            {data.skills.technical && (
              <div className="text-sm text-slate-800 mb-1">
                {formatSkillText(data.skills.technical)}
              </div>
            )}
            {data.skills.soft && (
              <div className="text-sm text-slate-800">
                <strong className="text-slate-900">Soft: </strong>{data.skills.soft}
              </div>
            )}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-800 pb-1 mb-3 tracking-widest">Certifications</h2>
            {data.certifications.map((cert, i) => (
              <div key={i} className="mb-2 flex justify-between items-center text-sm">
                <div>
                  <strong className="text-slate-900">
                    {cert.link ? <a href={getValidUrl(cert.link)} target="_blank" rel="noreferrer" className="hover:text-slate-600 hover:underline">{cert.title}</a> : cert.title}
                  </strong>
                  <span className="text-slate-400 mx-2">|</span>
                  <span className="text-slate-700 italic">{cert.issuer}</span>
                </div>
                <span className="text-xs text-slate-600 font-sans">{cert.year}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // RENDER LEFT PANEL FORMS
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <FiFileText className="text-amber-deep" /> Resume Builder
          </h1>
          <p className="font-body text-muted mt-2">Fill in your details, choose a template, and download an ATS-friendly PDF.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="modern">Modern Sidebar</option>
            <option value="minimalist">Minimalist</option>
            <option value="professional">Professional Serif</option>
          </select>
          <button
            onClick={loadSampleData}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors shadow-sm"
          >
            <FiZap /> Load Demo
          </button>
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            <FiDownload /> {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[800px]">
        {/* LEFT PANEL - FORMS */}
        <div className="w-full lg:w-[45%] xl:w-[40%] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex overflow-x-auto p-2.5 bg-slate-100/70 shrink-0 gap-2 border-b border-slate-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: "personal", icon: FiUser, label: "Personal" },
              { id: "education", icon: FiBook, label: "Education" },
              { id: "experience", icon: FiBriefcase, label: "Experience" },
              { id: "projects", icon: FiCode, label: "Projects" },
              { id: "skills", icon: FiAward, label: "Skills" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'}`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-white">

            {/* PERSONAL INFO */}
            {activeTab === "personal" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Personal Details</h3>
                  <p className="text-sm text-slate-500 mt-1">Provide your basic contact information and professional summary.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Full Name</label>
                    <input type="text" name="name" value={resumeData.personal.name} onChange={handlePersonalChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 text-sm" placeholder="John Doe" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Email</label>
                    <input type="email" name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 text-sm" placeholder="john@example.com" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Phone</label>
                    <input type="text" name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 text-sm" placeholder="+91 98765 43210" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">LinkedIn</label>
                    <input type="text" name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 text-sm" placeholder="linkedin.com/in/johndoe" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">GitHub</label>
                    <input type="text" name="github" value={resumeData.personal.github} onChange={handlePersonalChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 text-sm" placeholder="github.com/johndoe" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Portfolio / Website</label>
                    <input type="text" name="portfolio" value={resumeData.personal.portfolio} onChange={handlePersonalChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 text-sm" placeholder="johndoe.com" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Professional Summary</label>
                    <textarea name="summary" value={resumeData.personal.summary} onChange={handlePersonalChange} rows="4" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 text-sm resize-none custom-scrollbar" placeholder="Passionate software engineering student with experience in React and Node.js..."></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {activeTab === "education" && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Education</h3>
                  <button onClick={() => addField("education", { degree: "", college: "", year: "", gpa: "" })} className="text-sm flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    <FiPlus /> Add Education
                  </button>
                </div>

                {resumeData.education.length === 0 && <p className="text-sm text-slate-500 italic text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">No education added. Click 'Add Education' to start.</p>}

                <div className="space-y-4">
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                      <button onClick={() => removeField("education", i)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove"><FiTrash2 size={16} /></button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 pr-6">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Degree / Course</label>
                          <input type="text" value={edu.degree} onChange={e => updateField("education", i, "degree", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. B.Tech Computer Science" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">University / College</label>
                          <input type="text" value={edu.college} onChange={e => updateField("education", i, "college", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. ABC University" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Passing Year</label>
                          <input type="text" value={edu.year} onChange={e => updateField("education", i, "year", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 2024" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">CGPA / %</label>
                          <input type="text" value={edu.gpa} onChange={e => updateField("education", i, "gpa", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 8.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Experience</h3>
                  <button onClick={() => addField("experience", { role: "", company: "", duration: "", description: "" })} className="text-sm flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    <FiPlus /> Add Experience
                  </button>
                </div>

                {resumeData.experience.length === 0 && <p className="text-sm text-slate-500 italic text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">No experience added.</p>}

                <div className="space-y-4">
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                      <button onClick={() => removeField("experience", i)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 pr-6">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Job Role / Title</label>
                          <input type="text" value={exp.role} onChange={e => updateField("experience", i, "role", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Software Engineer Intern" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Company</label>
                          <input type="text" value={exp.company} onChange={e => updateField("experience", i, "company", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Google" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Duration</label>
                          <input type="text" value={exp.duration} onChange={e => updateField("experience", i, "duration", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Jan 2023 - Present" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Description (Bullet points recommended)</label>
                          <textarea value={exp.description} onChange={e => updateField("experience", i, "description", e.target.value)} rows="4" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="• Developed a new feature using React that increased user engagement by 20%&#10;• Optimized database queries..."></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Projects</h3>
                  <button onClick={() => addField("projects", { title: "", techStack: "", link: "", description: "" })} className="text-sm flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    <FiPlus /> Add Project
                  </button>
                </div>

                {resumeData.projects.length === 0 && <p className="text-sm text-slate-500 italic text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">No projects added.</p>}

                <div className="space-y-4">
                  {resumeData.projects.map((proj, i) => (
                    <div key={i} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                      <button onClick={() => removeField("projects", i)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 pr-6">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Project Title</label>
                          <input type="text" value={proj.title} onChange={e => updateField("projects", i, "title", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. E-Commerce Platform" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Link (Optional)</label>
                          <input type="text" value={proj.link} onChange={e => updateField("projects", i, "link", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. github.com/repo" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Tech Stack</label>
                          <input type="text" value={proj.techStack} onChange={e => updateField("projects", i, "techStack", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. MERN, Tailwind" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Description</label>
                          <textarea value={proj.description} onChange={e => updateField("projects", i, "description", e.target.value)} rows="4" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="• Built a full-stack platform using..."></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SKILLS */}
            {activeTab === "skills" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Skills</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Technical Skills</label>
                      <textarea name="technical" value={resumeData.skills.technical} onChange={handleSkillsChange} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="JavaScript, React, Node.js, Python, SQL..."></textarea>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Soft Skills</label>
                      <textarea name="soft" value={resumeData.skills.soft} onChange={handleSkillsChange} rows="2" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="Leadership, Agile, Communication..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Certifications</h3>
                    <button onClick={() => addField("certifications", { title: "", issuer: "", year: "", link: "" })} className="text-sm flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                      <FiPlus /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {resumeData.certifications.map((cert, i) => (
                      <div key={i} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex gap-2 items-center">
                          <input type="text" value={cert.title} onChange={e => updateField("certifications", i, "title", e.target.value)} placeholder="Title (e.g. AWS Cloud Practitioner)" className="flex-1 px-3 py-2 text-sm border border-transparent hover:border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white bg-slate-50" />
                          <button onClick={() => removeField("certifications", i)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"><FiTrash2 size={16} /></button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input type="text" value={cert.issuer} onChange={e => updateField("certifications", i, "issuer", e.target.value)} placeholder="Issuer (e.g. Amazon)" className="w-1/3 px-3 py-2 text-sm border border-transparent hover:border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white bg-slate-50" />
                          <input type="text" value={cert.year} onChange={e => updateField("certifications", i, "year", e.target.value)} placeholder="Year" className="w-24 px-3 py-2 text-sm border border-transparent hover:border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white bg-slate-50 text-center" />
                          <input type="text" value={cert.link} onChange={e => updateField("certifications", i, "link", e.target.value)} placeholder="Credential URL (Optional)" className="flex-1 px-3 py-2 text-sm border border-transparent hover:border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white bg-slate-50" />
                        </div>
                      </div>
                    ))}
                    {resumeData.certifications.length === 0 && <p className="text-sm text-slate-500 italic py-2">No certifications added.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div className="w-full lg:w-[55%] xl:w-[60%] bg-slate-300/50 rounded-2xl overflow-hidden relative flex justify-center items-start pt-8 pb-8 custom-scrollbar shadow-inner border border-slate-200" style={{ overflowY: "auto" }}>
          {/* Wrapper with fixed A4 aspect ratio using absolute pixel width to ensure html2canvas captures it perfectly */}
          <div className="bg-white shadow-2xl resume-preview-wrapper transition-all duration-300 transform origin-top hover:scale-[1.02]" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}>
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
