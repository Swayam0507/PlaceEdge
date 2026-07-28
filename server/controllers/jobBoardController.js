const axios = require("axios");
const indianJobs = require("../data/indianJobs");

/**
 * @desc    Get off-campus jobs from external API (RapidAPI JSearch) or local static fallback
 * @route   GET /api/jobBoard
 * @access  Private
 */
const getJobs = async (req, res) => {
  try {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : "developer";
    
    // Fallback function to use static data
    const useStaticFallback = () => {
      const filteredJobs = indianJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery) || 
        job.company_name.toLowerCase().includes(searchQuery)
      );
      // If no match found, just return all 20 to avoid empty screen
      const finalJobs = filteredJobs.length > 0 ? filteredJobs : indianJobs;
      return res.status(200).json({
        success: true,
        data: finalJobs,
        source: 'fallback'
      });
    };

    // Check if RAPIDAPI_KEY is configured
    if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === "YOUR_RAPIDAPI_KEY_HERE" || process.env.RAPIDAPI_KEY === "eb0a8b7826msh0482419dbbe8e49p188ae3jsnf1ba53a4da8b") {
      // User provided key is exhausted/invalid, use fallback immediately
      return useStaticFallback();
    }

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `${searchQuery} in India`,
        page: '1',
        num_pages: '1',
        country: 'in',
        date_posted: 'month'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    const jobs = response.data.data.map(job => ({
      title: job.job_title,
      company_name: job.employer_name,
      location: job.job_city ? `${job.job_city}, India` : 'India',
      job_types: [job.job_employment_type || 'FULLTIME'],
      url: job.job_apply_link || job.job_google_link,
      company_logo: job.employer_logo || `https://ui-avatars.com/api/?name=${job.employer_name}&background=e0e7ff&color=4f46e5&rounded=true`
    }));
    
    res.status(200).json({
      success: true,
      data: jobs,
      source: 'live'
    });
  } catch (error) {
    console.error("Job Board API Error:", error.message);
    
    // If API fails due to rate limit or subscription, just silently fallback to local Indian jobs
    if (error.response && (error.response.status === 429 || error.response.status === 403)) {
       return res.status(200).json({
          success: true,
          data: indianJobs,
          source: 'fallback'
       });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch off-campus jobs from JSearch."
    });
  }
};

module.exports = { getJobs };
