import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Onboarding.css';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    location: '',
    dueDate: '',
    weeksPregnant: '',
    medicalHistory: '',
    allergies: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();

  const totalSteps = 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    setError('');

    if (step === 1) {
      if (!formData.age || !formData.height || !formData.weight) {
        setError('Please fill in all basic information fields');
        return false;
      }
      if (parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
        setError('Please enter a valid age');
        return false;
      }
    } else if (step === 2) {
      if (!formData.location) {
        setError('Please enter your location');
        return false;
      }
    } else if (step === 3) {
      if (!formData.dueDate || !formData.weeksPregnant) {
        setError('Please fill in pregnancy information');
        return false;
      }
      if (parseInt(formData.weeksPregnant) < 1 || parseInt(formData.weeksPregnant) > 42) {
        setError('Please enter valid weeks pregnant (1-42)');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      await updateUserProfile({
        age: parseInt(formData.age),
        height: formData.height,
        weight: formData.weight,
        location: formData.location,
        dueDate: formData.dueDate,
        weeksPregnant: parseInt(formData.weeksPregnant),
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
      });

      // Defer navigation to next tick so AuthProvider state (hasCompletedOnboarding) propagates
      // before ProtectedRoute checks it, avoiding redirect back to onboarding
      setTimeout(() => navigate('/your-profile'), 0);
    } catch (err) {
      setError('Failed to save your information. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="onboarding-step">
            <h2>Basic Information</h2>
            <p className="step-description">Tell us a bit about yourself</p>

            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                min="18"
                max="100"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="height">Height *</label>
                <input
                  type="text"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="e.g., 5'6&quot;"
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight *</label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 140 lbs"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <h2>Location & Medical History</h2>
            <p className="step-description">Help us provide better care recommendations</p>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Austin, TX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medicalHistory">Medical History (Optional)</label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                placeholder="Any relevant medical history or conditions"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Allergies (Optional)</label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="List any allergies"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <h2>Pregnancy Information</h2>
            <p className="step-description">Almost done! Tell us about your pregnancy journey</p>

            <div className="form-group">
              <label htmlFor="dueDate">Expected Due Date *</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="weeksPregnant">Weeks Pregnant *</label>
              <input
                type="number"
                id="weeksPregnant"
                name="weeksPregnant"
                value={formData.weeksPregnant}
                onChange={handleInputChange}
                placeholder="Enter weeks (1-42)"
                min="1"
                max="42"
              />
            </div>

            <div className="pregnancy-info-note">
              <span className="note-icon">💡</span>
              <p>This information helps us provide personalized health tips and track your pregnancy milestones.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1 className="onboarding-logo">ConnectHER</h1>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="step-indicator">Step {currentStep} of {totalSteps}</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {error && <div className="error-message">{error}</div>}

          {renderStep()}

          <div className="button-group">
            {currentStep > 1 && (
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
              >
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="next-button"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="submit-button"
              >
                Complete Setup
              </button>
            )}
          </div>
        </form>

        <div className="onboarding-footer">
          <p>Your information is secure and private</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
