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
