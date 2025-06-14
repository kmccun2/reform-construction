import { useState } from 'react';
import './App.css';
import { textContent } from './utils/text-content.js';
import { 
  sendToGoogleSheets, 
  isGoogleSheetsConfigured,
  sendToGoogleSheetsViaIframe,
  sendToGoogleSheetsCorsFree,
  sendToGoogleSheetsViaParams
} from './utils/googleSheets.js';
import rcLogo from './assets/images/rc-logo.png';
import {
  FaTools,
  FaPhone,
  FaEnvelope,
  FaServicestack,
  FaInfoCircle,
  FaPhoneAlt,
  FaCheckCircle,
  FaShieldAlt,
  FaClock,
  FaDollarSign,
  FaStar
} from 'react-icons/fa';
import { GiConcreteBag, GiHammerNails, GiHouse, GiBrickWall } from 'react-icons/gi';
import { MdOutdoorGrill, MdHomeRepairService } from 'react-icons/md';

function App() {  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);

  // Smooth scroll function that accounts for header height
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    const header = document.querySelector('.header');

    if (element && header) {
      const headerHeight = header.offsetHeight;
      const elementPosition = element.offsetTop - headerHeight; // 20px extra padding

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle navigation clicks
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.service) newErrors.service = "Please select a service";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Prevent double submissions
      if (isSubmitting || submissionComplete) {
        console.warn('Form submission already in progress or completed');
        return;
      }

      setIsSubmitting(true);
      setSubmissionComplete(true);

      // Create unique submission ID to prevent duplicates
      const currentSubmissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSubmissionId(currentSubmissionId);

      try {
        // Send data to Google Sheets if configured
        if (isGoogleSheetsConfigured()) {
          console.log('📝 Submitting form data to Google Sheets...');
          
          // Add submission ID to form data to help track duplicates
          const formDataWithId = {
            ...formData,
            submissionId: currentSubmissionId,
            timestamp: new Date().toISOString()
          };

          const result = await sendToGoogleSheets(formDataWithId);
          console.log('✅ Form submitted successfully:', result);
          
        } else {
          console.warn('Google Sheets integration not configured. Check your .env file.');
          console.log('Form data:', formData);
        }

        setIsSubmitted(true);

        // Reset form after successful submission
        setTimeout(() => {
          setIsSubmitted(false);
          setSubmissionId(null);
          setSubmissionComplete(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            service: '',
            message: ''
          });
        }, 3000);
        
      } catch (error) {
        console.error('Error submitting form:', error);

        // Provide user-friendly error message
        let errorMessage = 'There was an error submitting your form. ';
        
        if (error.message.includes('Network error') || error.message.includes('Unable to reach')) {
          errorMessage += 'Please check your internet connection and try again. ';
        } else if (error.message.includes('timed out')) {
          errorMessage += 'The request timed out. Please try again. ';
        } else if (error.message.includes('Server error')) {
          errorMessage += 'There was a server error. Please try again in a few minutes. ';
        } else {
          errorMessage += 'Please try again or ';
        }

        errorMessage += 'contact us directly at andrew@rcrla.com or brennyn@rcrla.com.';
        alert(errorMessage);
        
      } finally {
        setIsSubmitting(false);
        setSubmissionComplete(false);
      }
    } else {
      setErrors(newErrors);
    }
  };
  // Simple diagnostic function to test Google Apps Script
  const testGoogleScript = async () => {
    const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;

    console.log('🔍 Testing Google Apps Script directly...');
    console.log('URL:', googleSheetsUrl);

    if (!googleSheetsUrl || googleSheetsUrl === 'your_google_apps_script_web_app_url_here') {
      alert('❌ Google Sheets URL not configured in .env file!');
      return;
    }

    try {
      // Test 1: Simple GET request with more detailed error handling
      console.log('Test 1: GET request...');

      try {
        const getResponse = await fetch(googleSheetsUrl, {
          method: 'GET',
          mode: 'cors'
        });

        console.log('GET Response Status:', getResponse.status);
        console.log('GET Response OK:', getResponse.ok);

        if (!getResponse.ok) {
          throw new Error(`HTTP ${getResponse.status}: ${getResponse.statusText}`);
        }

        const getText = await getResponse.text();
        console.log('GET Response Text:', getText);

        if (getText.includes('Google Apps Script is working')) {
          console.log('✅ GET test passed - Google Apps Script is responding');
        } else {
          console.warn('⚠️ GET test returned unexpected response');
        }

      } catch (getError) {
        console.error('❌ GET test failed:', getError);

        // Provide specific error guidance
        if (getError.message.includes('Failed to fetch')) {
          alert(`❌ Connection failed!\n\nThis usually means:\n1. Google Apps Script URL is wrong\n2. Script not deployed as web app\n3. Script permissions not set correctly\n\nCheck TROUBLESHOOTING_NO_DATA.md for detailed fix instructions.`);
          return;
        } else if (getError.message.includes('CORS')) {
          alert(`❌ CORS error!\n\nYour Google Apps Script isn't properly configured for web access.\n\nCheck TROUBLESHOOTING_NO_DATA.md for fix instructions.`);
          return;
        }

        throw getError;
      }

      // Test 2: POST request with test data
      console.log('Test 2: POST request with test data...');
      const testData = {
        timestamp: new Date().toISOString(),
        submissionId: `test_${Date.now()}`,
        name: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
        service: 'Test Service',
        message: 'This is a diagnostic test'
      };

      const postResponse = await fetch(googleSheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(testData),
        mode: 'cors'
      });

      console.log('POST Response Status:', postResponse.status);
      const postText = await postResponse.text();
      console.log('POST Response:', postText);

      // Test 3: GET with parameters
      console.log('Test 3: GET with parameters...');
      const params = new URLSearchParams({
        ...testData,
        submissionId: `test_params_${Date.now()}`
      });

      const paramResponse = await fetch(`${googleSheetsUrl}?${params.toString()}`, {
        mode: 'cors'
      });

      console.log('GET Params Response Status:', paramResponse.status);
      const paramText = await paramResponse.text();
      console.log('GET Params Response:', paramText);

      alert('✅ Diagnostic test completed!\n\nCheck the browser console for detailed results and your Google Sheet for test entries.\n\nIf you see errors in the console, check TROUBLESHOOTING_NO_DATA.md for solutions.');

    } catch (error) {
      console.error('❌ Diagnostic test failed:', error);

      let errorMessage = '❌ Diagnostic test failed!\n\n';

      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Connection Error: Cannot reach Google Apps Script.\n\n';
        errorMessage += 'Common causes:\n';
        errorMessage += '• Wrong script URL in .env file\n';
        errorMessage += '• Script not deployed as web app\n';
        errorMessage += '• Script permissions not set to "Anyone"\n\n';
        errorMessage += 'Check TROUBLESHOOTING_NO_DATA.md for detailed fix instructions.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage += 'Network Error: Check your internet connection.';
      } else {
        errorMessage += `Error: ${error.message}\n\n`;
        errorMessage += 'Check the browser console for more details.';
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="app">
      {/* Header */}      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <img src={rcLogo} alt="Reform Construction Logo" className="nav-logo" />
            <h1>{textContent.company.name}</h1>
          </div><div className="nav-links">
            <a href="#services" onClick={(e) => handleNavClick(e, 'services')}>
              <FaServicestack className="nav-icon" />{textContent.navigation.services}
            </a>
            <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>
              <FaInfoCircle className="nav-icon" />{textContent.navigation.about}
            </a>
            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>
              <FaPhoneAlt className="nav-icon" />{textContent.navigation.contact}
            </a>
          </div>
        </nav>
      </header>      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>{textContent.hero.title}</h2>
          <p>{textContent.hero.description}</p>
          <a
            href="#contact"
            className="cta-button"
            onClick={(e) => handleNavClick(e, 'contact')}
          >
            {textContent.hero.ctaButton}
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2>{textContent.services.title}</h2>
          <div className="services-grid">
            {textContent.services.items.map((service, index) => {
              let IconComponent;
              switch (service.title) {
                case 'Concrete':
                  IconComponent = GiConcreteBag;
                  break;
                case 'Framing':
                  IconComponent = GiHammerNails;
                  break;
                case 'Roofing':
                  IconComponent = GiHouse;
                  break;
                case 'Masonry':
                  IconComponent = GiBrickWall;
                  break;
                case 'Outdoor Living':
                  IconComponent = MdOutdoorGrill;
                  break;
                case 'Remodeling':
                  IconComponent = MdHomeRepairService;
                  break;
                default:
                  IconComponent = FaTools;
              }

              return (
                <div key={index} className="service-card">
                  <div className="service-icon">
                    <IconComponent />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <h2>{textContent.about.title}</h2>
            {textContent.about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <p>
              <br></br>
              <strong>Our Mission:</strong> {textContent.company.mission}
            </p>
            <div className="about-features">
              {textContent.about.features.map((feature, index) => {
                let IconComponent;
                switch (feature) {
                  case 'Licensed and Insured':
                    IconComponent = FaShieldAlt;
                    break;
                  case 'Quality Workmanship':
                    IconComponent = FaStar;
                    break;
                  case 'On-Time Completion':
                    IconComponent = FaClock;
                    break;
                  case 'Competitive Pricing':
                    IconComponent = FaDollarSign;
                    break;
                  case 'Customer Satisfaction Guarantee':
                    IconComponent = FaCheckCircle;
                    break;
                  default:
                    IconComponent = FaCheckCircle;
                }

                return (
                  <div key={index} className="feature">
                    <IconComponent className="feature-icon" />
                    <span>{feature}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>{textContent.contact.title}</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="owners-info">
                {textContent.contact.owners.map((owner, index) => (
                  <div key={index} className="owner-card">
                    <h3>{owner.name}</h3>
                    <p className="owner-title">{owner.title}</p>
                    <div className="owner-details">
                      <div className="contact-item">
                        <FaPhone className="contact-icon" />
                        <strong>Phone:</strong> <span>{owner.phone}</span>
                      </div>
                      <div className="contact-item">
                        <FaEnvelope className="contact-icon" />
                        <strong>Email:</strong> <span>{owner.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              {isSubmitted ? (
                <div className="success-message">
                  <h3>Thank You!</h3>
                  <p>Your message has been sent successfully. We'll get back to you soon.</p>
                </div>
              ) : (
                <>
                  <h3 className='form-title'>{textContent.contact.form.title}</h3>

                  <div className="form-group">
                    <label htmlFor="name">{textContent.contact.form.fields.name}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">{textContent.contact.form.fields.email}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">{textContent.contact.form.fields.phone}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="service">{textContent.contact.form.fields.service}</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className={errors.service ? 'error' : ''}
                    >
                      <option value="">Select a service...</option>
                      {textContent.contact.form.services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                    {errors.service && <span className="error-text">{errors.service}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">{textContent.contact.form.fields.message}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="5"
                      className={errors.message ? 'error' : ''}
                    ></textarea>
                    {errors.message && <span className="error-text">{errors.message}</span>}
                  </div>                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : textContent.contact.form.submitButton}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>{textContent.footer.copyright}</p>
          <p>{textContent.footer.tagline}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
