const axios = require('axios');
const xml2js = require('xml2js');

const feedSources = [
  { url: 'https://jobicy.com/?feed=job_feed', name: 'Jobicy - All' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time', name: 'Jobicy - SMM Full-time' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france', name: 'Jobicy - Seller France' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia', name: 'Jobicy - Design/Multimedia' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=data-science', name: 'Jobicy - Data Science' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=copywriting', name: 'Jobicy - Copywriting' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=business', name: 'Jobicy - Business' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=management', name: 'Jobicy - Management' },
  { url: 'https://www.higheredjobs.com/rss/articleFeed.cfm', name: 'HigherEdJobs' },
];

class JobFetcher {
  async fetchFromURL(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error.message);
      throw error;
    }
  }

  async xmlToJson(xmlData) {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      normalize: true,
      normalizeTags: true,
      trim: true,
    });

    try {
      const result = await parser.parseStringPromise(xmlData);
      return result;
    } catch (error) {
      console.error('XML parsing error:', error.message);
      throw error;
    }
  }

  parseJobicyFeed(jsonData) {
    const jobs = [];
    
    try {
      const items = jsonData?.rss?.channel?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      itemArray.forEach((item) => {
        if (!item) return;

        const job = {
          jobId: item.guid || item.link || `job_${Date.now()}_${Math.random()}`,
          title: item.title || 'No Title',
          company: item['company_name'] || item.company || 'Unknown',
          location: item['job_location'] || item.location || 'Remote',
          jobType: item['job_type'] || 'Full-time',
          category: item.category || 'General',
          description: item.description || item['content:encoded'] || '',
          url: item.link || item.guid || '',
          publishedDate: item.pubdate || item.pubDate || new Date(),
          source: 'Jobicy',
          rawData: item,
        };

        jobs.push(job);
      });
    } catch (error) {
      console.error('Error parsing Jobicy feed:', error.message);
    }

    return jobs;
  }

  parseHigherEdJobsFeed(jsonData) {
    const jobs = [];
    
    try {
      const items = jsonData?.rss?.channel?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      itemArray.forEach((item) => {
        if (!item) return;

        const job = {
          jobId: item.guid || item.link || `job_${Date.now()}_${Math.random()}`,
          title: item.title || 'No Title',
          company: item['dc:creator'] || 'Unknown',
          location: item.location || 'Not Specified',
          jobType: 'Full-time',
          category: item.category || 'Higher Education',
          description: item.description || '',
          url: item.link || '',
          publishedDate: item.pubdate || item.pubDate || new Date(),
          source: 'HigherEdJobs',
          rawData: item,
        };

        jobs.push(job);
      });
    } catch (error) {
      console.error('Error parsing HigherEdJobs feed:', error.message);
    }

    return jobs;
  }

  async fetchAndParseJobs(url, sourceName) {
    try {
      const xmlData = await this.fetchFromURL(url);
      const jsonData = await this.xmlToJson(xmlData);

      let jobs = [];
      if (sourceName.includes('HigherEdJobs')) {
        jobs = this.parseHigherEdJobsFeed(jsonData);
      } else {
        jobs = this.parseJobicyFeed(jsonData);
      }

      return jobs;
    } catch (error) {
      console.error(`Error in fetchAndParseJobs for ${sourceName}:`, error.message);
      return [];
    }
  }

  getFeedSources() {
    return feedSources;
  }
}

module.exports = new JobFetcher();
