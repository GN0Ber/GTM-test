// Utility functions for Google Tag Manager events

export const gtmPush = (eventData) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
    console.log('GTM Event:', eventData);
  }
};

// User Events
export const gtmUserRegister = (userId, email) => {
  gtmPush({
    event: 'user_register',
    user_id: userId,
    email: email,
    timestamp: new Date().toISOString()
  });
};

export const gtmUserLogin = (userId, email) => {
  gtmPush({
    event: 'user_login',
    user_id: userId,
    email: email,
    timestamp: new Date().toISOString()
  });
};

export const gtmUserLogout = (userId) => {
  gtmPush({
    event: 'user_logout',
    user_id: userId,
    timestamp: new Date().toISOString()
  });
};

// Suitability Events
export const gtmSuitabilityStart = (userId) => {
  gtmPush({
    event: 'suitability_start',
    user_id: userId,
    timestamp: new Date().toISOString()
  });
};

export const gtmSuitabilityComplete = (userId, profile, score) => {
  gtmPush({
    event: 'suitability_complete',
    user_id: userId,
    profile: profile,
    score: score,
    timestamp: new Date().toISOString()
  });
};

// Chat Events
export const gtmChatStart = (userId) => {
  gtmPush({
    event: 'chat_start',
    user_id: userId,
    timestamp: new Date().toISOString()
  });
};

export const gtmChatMessage = (userId, messageType) => {
  gtmPush({
    event: 'chat_message',
    user_id: userId,
    message_type: messageType, // 'user' or 'assistant'
    timestamp: new Date().toISOString()
  });
};

export const gtmChatEnd = (userId, sessionId) => {
  gtmPush({
    event: 'chat_end',
    user_id: userId,
    session_id: sessionId,
    timestamp: new Date().toISOString()
  });
};

// Recommendation Events
export const gtmRecommendationRequest = (userId, sessionId) => {
  gtmPush({
    event: 'recommendation_request',
    user_id: userId,
    session_id: sessionId,
    timestamp: new Date().toISOString()
  });
};

export const gtmRecommendationView = (userId, recommendationId, assets) => {
  gtmPush({
    event: 'recommendation_view',
    user_id: userId,
    recommendation_id: recommendationId,
    assets_count: assets.length,
    timestamp: new Date().toISOString()
  });
};

export const gtmRecommendationInvest = (userId, recommendationId) => {
  gtmPush({
    event: 'recommendation_invest_click',
    user_id: userId,
    recommendation_id: recommendationId,
    timestamp: new Date().toISOString()
  });
};

// Plan Events
export const gtmPlanView = (userId, planId, planName) => {
  gtmPush({
    event: 'plan_view',
    user_id: userId,
    plan_id: planId,
    plan_name: planName,
    timestamp: new Date().toISOString()
  });
};

export const gtmPlanSelect = (userId, planId, planName, price) => {
  gtmPush({
    event: 'plan_select',
    user_id: userId,
    plan_id: planId,
    plan_name: planName,
    price: price,
    timestamp: new Date().toISOString()
  });
};

// Payment Events
export const gtmPaymentStart = (userId, planId, amount) => {
  gtmPush({
    event: 'payment_start',
    user_id: userId,
    plan_id: planId,
    amount: amount,
    timestamp: new Date().toISOString()
  });
};

export const gtmPaymentSuccess = (userId, paymentId, planId, amount) => {
  gtmPush({
    event: 'payment_success',
    user_id: userId,
    payment_id: paymentId,
    plan_id: planId,
    amount: amount,
    timestamp: new Date().toISOString()
  });
};

export const gtmPaymentFailed = (userId, planId, amount, error) => {
  gtmPush({
    event: 'payment_failed',
    user_id: userId,
    plan_id: planId,
    amount: amount,
    error: error,
    timestamp: new Date().toISOString()
  });
};

// Card Events
export const gtmCardAdd = (userId, cardBrand) => {
  gtmPush({
    event: 'card_add',
    user_id: userId,
    card_brand: cardBrand,
    timestamp: new Date().toISOString()
  });
};

export const gtmCardRemove = (userId, cardId) => {
  gtmPush({
    event: 'card_remove',
    user_id: userId,
    card_id: cardId,
    timestamp: new Date().toISOString()
  });
};

// Page View Events
export const gtmPageView = (pageName, userId = null) => {
  gtmPush({
    event: 'page_view',
    page_name: pageName,
    user_id: userId,
    timestamp: new Date().toISOString()
  });
};

// Error Events
export const gtmError = (errorType, errorMessage, userId = null) => {
  gtmPush({
    event: 'error',
    error_type: errorType,
    error_message: errorMessage,
    user_id: userId,
    timestamp: new Date().toISOString()
  });
};

