// Data service to simulate API calls with JSON files
import usersData from '../data/users.json';
import suitabilityData from '../data/suitability.json';
import sessionsData from '../data/sessions.json';
import recommendationsData from '../data/recommendations.json';
import plansData from '../data/plans.json';
import contractsData from '../data/contracts.json';
import paymentsData from '../data/payments.json';
import cardsData from '../data/cards.json';

// Simulate async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Users
export const getUsers = async () => {
  await delay(100);
  return usersData;
};

export const getUserById = async (id) => {
  await delay(100);
  return usersData.find(user => user.user_id === parseInt(id));
};

export const authenticateUser = async (email, password) => {
  await delay(200);
  // Simple authentication - in real app, password would be hashed
  const user = usersData.find(u => u.email === email);
  if (user) {
    return user;
  }
  throw new Error('Credenciais inválidas');
};

export const registerUser = async (userData) => {
  await delay(200);
  // In a real app, this would save to database
  const newUser = {
    user_id: usersData.length + 1,
    ...userData,
    sign_on_date: new Date().toISOString().split('T')[0]
  };
  return newUser;
};

// Suitability
export const getSuitabilityByUserId = async (userId) => {
  await delay(100);
  return suitabilityData.filter(s => s.user_id === parseInt(userId));
};

export const saveSuitability = async (suitabilityData) => {
  await delay(200);
  const newSuitability = {
    suitability_id: Math.max(...suitabilityData.map(s => s.suitability_id)) + 1,
    ...suitabilityData,
    evaluation_date: new Date().toISOString().split('T')[0]
  };
  return newSuitability;
};

// Sessions
export const getSessionsByUserId = async (userId) => {
  await delay(100);
  return sessionsData.filter(s => s.user_id === parseInt(userId));
};

export const saveSession = async (sessionData) => {
  await delay(200);
  const newSession = {
    session_id: sessionsData.length + 1,
    ...sessionData,
    session_date: new Date().toISOString().split('T')[0]
  };
  return newSession;
};

// Recommendations
export const getRecommendationsByUserId = async (userId) => {
  await delay(100);
  return recommendationsData.filter(r => r.user_id === parseInt(userId));
};

export const getRecommendationById = async (id) => {
  await delay(100);
  return recommendationsData.find(r => r.recommendation_id === parseInt(id));
};

export const saveRecommendation = async (recommendationData) => {
  await delay(200);
  const newRecommendation = {
    recommendation_id: recommendationsData.length + 1,
    ...recommendationData,
    request_date: new Date().toISOString().split('T')[0]
  };
  return newRecommendation;
};

// Plans
export const getPlans = async () => {
  await delay(100);
  return plansData;
};

export const getPlanById = async (id) => {
  await delay(100);
  return plansData.find(p => p.plan_id === parseInt(id));
};

// Contracts
export const getContractsByUserId = async (userId) => {
  await delay(100);
  return contractsData.filter(c => c.user_id === parseInt(userId));
};

export const saveContract = async (contractData) => {
  await delay(200);
  const newContract = {
    ...contractData,
    contract_date: new Date().toISOString().split('T')[0]
  };
  return newContract;
};

// Payments
export const getPaymentsByUserId = async (userId) => {
  await delay(100);
  return paymentsData.filter(p => p.user_id === parseInt(userId));
};

export const savePayment = async (paymentData) => {
  await delay(200);
  const newPayment = {
    payment_id: paymentsData.length + 1,
    ...paymentData,
    payment_date: new Date().toISOString().split('T')[0]
  };
  return newPayment;
};

// Cards
export const getCardsByUserId = async (userId) => {
  await delay(100);
  return cardsData.filter(c => c.user_id === parseInt(userId));
};

export const saveCard = async (cardData) => {
  await delay(200);
  const newCard = {
    card_id: cardsData.length + 1,
    ...cardData
  };
  return newCard;
};

export const deleteCard = async (cardId) => {
  await delay(200);
  // In a real app, this would delete from database
  return true;
};

