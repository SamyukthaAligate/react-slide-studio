import React, { useState } from 'react';
import './ShareModal.css';

const ShareModal = ({ onClose, presentationTitle }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    const subject = encodeURIComponent(`Check out my presentation: ${presentationTitle}`);
    const body = encodeURIComponent(
      `${message}\n\nView the presentation at: ${shareUrl}`
    );
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    onClose();
  };

  const handleSocialShare = (platform) => {
    const text = encodeURIComponent(`Check out my presentation: ${presentationTitle}`);
    const url = encodeURIComponent(shareUrl);

    let shareLink = '';
    switch(platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>
            <i className="fas fa-share-alt"></i>
            Share Presentation
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="share-modal-content">
          {/* Copy Link Section */}
          <div className="share-section">
            <h3>
              <i className="fas fa-link"></i>
              Share Link
            </h3>
            <div className="link-share">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="share-link-input"
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Email Share Section */}
          <div className="share-section">
            <h3>
              <i className="fas fa-envelope"></i>
              Share via Email
            </h3>
            <div className="email-share">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
              />
              <textarea
                placeholder="Add a message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input"
                rows="3"
              />
              <button className="send-email-btn" onClick={handleEmailShare}>
                <i className="fas fa-paper-plane"></i>
                Send Email
              </button>
            </div>
          </div>

          {/* Social Media Share Section */}
          <div className="share-section">
            <h3>
              <i className="fas fa-share-nodes"></i>
              Share on Social Media
            </h3>
            <div className="social-share">
              <button 
                className="social-btn twitter"
                onClick={() => handleSocialShare('twitter')}
                title="Share on Twitter"
              >
                <i className="fab fa-twitter"></i>
                Twitter
              </button>
              <button 
                className="social-btn facebook"
                onClick={() => handleSocialShare('facebook')}
                title="Share on Facebook"
              >
                <i className="fab fa-facebook"></i>
                Facebook
              </button>
              <button 
                className="social-btn linkedin"
                onClick={() => handleSocialShare('linkedin')}
                title="Share on LinkedIn"
              >
                <i className="fab fa-linkedin"></i>
                LinkedIn
              </button>
              <button 
                className="social-btn whatsapp"
                onClick={() => handleSocialShare('whatsapp')}
                title="Share on WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="share-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
