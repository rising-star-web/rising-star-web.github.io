const chinese = window.location.href.includes("cn");
const BASE_URL = 'https://backend4.sharemyworks.com/api/';
//const BASE_URL = 'http://localhost:3000/api/';

// Mapping for common qualitative statuses between English and Chinese
const EN_TO_ZH_PROGRESS = {
  'Trying to catch up!': {
    en: [
      'Making good progress with extra support',
      'Could use some additional help',
      'Developing steadily with guidance',
      'Advancing with support and practice',
    ],
    zh: [
      '需要一些额外帮助',
      '需要一些指导',
      '需要多加练习',
    ],
  },
  'Meeting expectations': {
    en: [
      'Meeting expectations',
      'Good progress',
      'On track',
      'Doing well',
      'Keep it up',
    ],
    zh: [
      '达到预期',
      '表现不错',
      '符合要求',
      '表现良好',
      '继续保持！',
    ],
  },
  'Exceeding expectations': {
    en: [
      'Exceeding expectations',
      'Outstanding work',
      'Excellent performance',
      'Above and beyond',
      'Impressive progress',
    ],
    zh: [
      '超出预期',
      '表现优秀',
      '非常棒！',
      '超出要求',
      '值得表扬！',
    ],
  },
};

// Mapping for behavior statuses between English and Chinese
const EN_TO_ZH_BEHAVIOR = {
  'Behavior needs improvement': {
    en: [
      'Learning to develop better classroom habits',
      'Building better classroom behaviors',
      'Growing in classroom behavior',
    ],
    zh: [
      '正在学习课堂习惯',
      '正在建立更好的课堂行为',
      '课堂行为有待提高',
    ],
  },
  'Generally well behaved': {
    en: [
      'Generally well behaved',
      'Good classroom behavior',
      'Follows rules most of the time',
      'Appropriate classroom conduct',
    ],
    zh: [
      '总体表现良好',
      '课堂纪律不错',
      '表现很好',
      '课堂行为得当',
    ],
  },
  'Excellent behavior': {
    en: [
      'Excellent behavior',
      'Model student behavior',
      'Outstanding classroom conduct',
      'Exemplary behavior',
    ],
    zh: [
      '行为表现很优秀',
      '模范学生',
      '课堂表现很好',
      '赞!',
      '课堂礼仪很好',
    ],
  },
  'Excellent': {
    en: [
      'Excellent behavior',
      'Model student behavior',
      'Outstanding classroom conduct',
      'Exemplary behavior',
    ],
    zh: [
      '行为表现很优秀',
      '模范学生',
      '课堂表现很好',
      '赞!',
      '课堂礼仪很好',
    ],
  },
};

// Mapping for knowledge retention statuses between English and Chinese
const EN_TO_ZH_KNOWLEDGE_RETENTION = {
  'Will need review sessions': {
    en: [
      'Will benefit from additional practice sessions',
      'Can improve with extra review time',
      'Need a bit more practice',
      'Could use some extra practice',
    ],
    zh: [
      '还需多加练习',
      '需要多加巩固',
      '需要多加练习',
    ],
  },
  'With enough at-home practice': {
    en: [
      'Will learn well with at-home practice',
      'Good retention with enough practice',
      'Can get solid understanding with practice',
    ],
    zh: [
      '多练习就能掌握!',
      '多加练习就没问题',
      '一定能掌握!',
      '加油多练就没问题',
    ],
  },
  'Definitely!': {
    en: [
      'Definitely retains knowledge!',
      'Excellent knowledge retention',
      'Outstanding memory and understanding',
      'Fantastic at retaining concepts',
      'Superb knowledge retention!',
    ],
    zh: [
      '知识掌握得非常好！',
      '记忆和理解能力突出',
      '概念掌握得很棒',
      '知识掌握能力超强！',
    ],
  },
};

// Function to randomly select a translation for a given progress level
function getRandomProgressTranslation(englishProgress, useEnglish = false) {
  // First try exact match
  let progressData = EN_TO_ZH_PROGRESS[englishProgress];
  
  // If no exact match, try partial matches
  if (!progressData) {
    const lowerProgress = englishProgress.toLowerCase();
    
    // Check for partial matches
    if (lowerProgress.includes('exceeding') || lowerProgress.includes('outstanding') || lowerProgress.includes('excellent') || lowerProgress.includes('above')) {
      progressData = EN_TO_ZH_PROGRESS['Exceeding expectations'];
    } else if (lowerProgress.includes('meeting') || lowerProgress.includes('good') || lowerProgress.includes('track') || lowerProgress.includes('well')) {
      progressData = EN_TO_ZH_PROGRESS['Meeting expectations'];
    } else if (lowerProgress.includes('catch up') || lowerProgress.includes('help') || lowerProgress.includes('support') || lowerProgress.includes('trying')) {
      progressData = EN_TO_ZH_PROGRESS['Trying to catch up!'];
    }
  }
  
  if (!progressData) {
    return englishProgress; // fallback to original if not found
  }

  if (useEnglish) {
    // Randomly select from English variations
    const randomIndex = Math.floor(Math.random() * progressData.en.length);
    return progressData.en[randomIndex];
  } else {
    // Randomly select from Chinese variations
    const randomIndex = Math.floor(Math.random() * progressData.zh.length);
    return progressData.zh[randomIndex];
  }
}

// Function to randomly select a behavior translation
function getRandomBehaviorTranslation(englishBehavior, useEnglish = false) {
  // First try exact match
  let behaviorData = EN_TO_ZH_BEHAVIOR[englishBehavior];
  
  // If no exact match, try partial matches
  if (!behaviorData) {
    const lowerBehavior = englishBehavior.toLowerCase();
    
    // Check for partial matches
    if (lowerBehavior.includes('excellent') || lowerBehavior.includes('outstanding')) {
      behaviorData = EN_TO_ZH_BEHAVIOR['Excellent'];
    } else if (lowerBehavior.includes('well behaved') || lowerBehavior.includes('good') || lowerBehavior.includes('appropriate')) {
      behaviorData = EN_TO_ZH_BEHAVIOR['Generally well behaved'];
    } else if (lowerBehavior.includes('improvement') || lowerBehavior.includes('needs') || lowerBehavior.includes('developing')) {
      behaviorData = EN_TO_ZH_BEHAVIOR['Behavior needs improvement'];
    }
  }
  
  if (!behaviorData) {
    return englishBehavior; // fallback to original if not found
  }

  if (useEnglish) {
    const randomIndex = Math.floor(Math.random() * behaviorData.en.length);
    return behaviorData.en[randomIndex];
  } else {
    const randomIndex = Math.floor(Math.random() * behaviorData.zh.length);
    return behaviorData.zh[randomIndex];
  }
}

// Function to randomly select a knowledge retention translation
function getRandomKnowledgeRetentionTranslation(englishKnowledge, useEnglish = false) {
  // First try exact match
  let knowledgeData = EN_TO_ZH_KNOWLEDGE_RETENTION[englishKnowledge];
  
  // If no exact match, try partial matches
  if (!knowledgeData) {
    const lowerKnowledge = englishKnowledge.toLowerCase();
    
    // Check for partial matches
    if (lowerKnowledge.includes('definitely') || lowerKnowledge.includes('excellent') || lowerKnowledge.includes('outstanding') || lowerKnowledge.includes('fantastic')) {
      knowledgeData = EN_TO_ZH_KNOWLEDGE_RETENTION['Definitely!'];
    } else if (lowerKnowledge.includes('at-home') || lowerKnowledge.includes('practice') || lowerKnowledge.includes('enough') || lowerKnowledge.includes('good retention')) {
      knowledgeData = EN_TO_ZH_KNOWLEDGE_RETENTION['With enough at-home practice'];
    } else if (lowerKnowledge.includes('review') || lowerKnowledge.includes('need') || lowerKnowledge.includes('sessions') || lowerKnowledge.includes('improvement')) {
      knowledgeData = EN_TO_ZH_KNOWLEDGE_RETENTION['Will need review sessions'];
    }
  }
  
  if (!knowledgeData) {
    return englishKnowledge; // fallback to original if not found
  }

  if (useEnglish) {
    const randomIndex = Math.floor(Math.random() * knowledgeData.en.length);
    return knowledgeData.en[randomIndex];
  } else {
    const randomIndex = Math.floor(Math.random() * knowledgeData.zh.length);
    return knowledgeData.zh[randomIndex];
  }
}

document.addEventListener("DOMContentLoaded", function () {
    // Parse URL parameters
    const url = new URL(window.location.href);
    const feedbackId = url.searchParams.get("feedbackId");

    if (!feedbackId) {
        console.error("Missing required parameter: feedbackId");
        var message = chinese ? '缺少必需参数。请检查URL是否正确。' : 'Missing required parameter. Please check if the URL is correct.';
        Toastify({
            text: message,
            duration: 5000,
            close: true,
            gravity: "top",
            position: 'right',
            style: {
                background: "red",
            },
            className: "info",
        }).showToast();
        return;
    }

    fetchRegularFeedback(feedbackId);
});

async function fetchRegularFeedback(feedbackId) {
    try {
        const response = await fetch(`${BASE_URL}Feedback/detailed/${feedbackId}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        displayRegularFeedback(data.feedback);
    } catch (error) {
        console.error("Error fetching regular feedback:", error);
        var message = chinese ? '获取反馈失败！请重新尝试或者联系管理人员' : 'Failed to get feedback! Please try again or contact the administrator.';
        Toastify({
            text: message,
            duration: 5000,
            close: true,
            gravity: "top",
            position: 'right',
            style: {
                background: "red",
            },
            className: "info",
        }).showToast();
        
        // Show placeholder data if API fails
        showPlaceholderData();
    }
}

function displayRegularFeedback(feedback) {
    // Update header with student name and date
    document.getElementById("studentNameDisplay").textContent = feedback.studentName || (chinese ? "学生姓名" : "Student Name");
    document.getElementById("dateDisplay").textContent = formatDate(feedback.date);
    
    // Update main feedback content - use the main text field
    document.getElementById("mainFeedbackContent").textContent = feedback.text || (chinese ? "暂无反馈内容" : "No feedback content available");
    
    // Update homework status
    const homeworkIcon = document.getElementById("homeworkIcon");
    const homeworkStatusText = document.getElementById("homeworkStatusText");
    
    if (feedback.didHomework == true) {
        homeworkIcon.textContent = "✓";
        homeworkIcon.className = "status-icon completed";
        homeworkStatusText.textContent = chinese ? "学生按时完成了作业" : "Student completed their homework";
    } else if (feedback.didHomework == false) {
        homeworkIcon.textContent = "✗";
        homeworkIcon.className = "status-icon not-completed";
        homeworkStatusText.textContent = chinese ? "学生未完成作业" : "Student did not complete their homework";
    } else {
      homeworkIcon.textContent = "-";
      homeworkIcon.className = "status-icon";
      homeworkStatusText.textContent = chinese ? "这节课未布置作业" : "This class did not have homework";
    }
    
    // Update performance content - use translation if available
    const performanceText = feedback.performance || (chinese ? "暂无表现评价" : "No performance evaluation available");
    document.getElementById("performanceContent").textContent = chinese ? 
        getRandomProgressTranslation(performanceText, false) : 
        getRandomProgressTranslation(performanceText, true);
    
    // Update development skills content - use codingHabits field with translation
    const codingHabitsText = feedback.codingHabits || (chinese ? "暂无技能评价" : "No skills evaluation available");
    document.getElementById("developmentSkillsContent").textContent = chinese ? 
        getRandomProgressTranslation(codingHabitsText, false) : 
        getRandomProgressTranslation(codingHabitsText, true);
    
    // Update behavior content - use translation if available
    const behaviorText = feedback.behavior || (chinese ? "暂无行为评价" : "No behavior evaluation available");
    document.getElementById("behaviorContent").textContent = chinese ? 
        getRandomBehaviorTranslation(behaviorText, false) : 
        getRandomBehaviorTranslation(behaviorText, true);
    
    // Update knowledge retention content - use translation if available
    const knowledgeText = feedback.knowledgeRetention || (chinese ? "暂无知识掌握评价" : "No knowledge retention evaluation available");
    document.getElementById("knowledgeRetentionContent").textContent = chinese ? 
        getRandomKnowledgeRetentionTranslation(knowledgeText, false) : 
        getRandomKnowledgeRetentionTranslation(knowledgeText, true);
}

function showPlaceholderData() {
    // Show placeholder data when API fails
    const currentDate = new Date().toLocaleDateString();
    
    document.getElementById("studentNameDisplay").textContent = chinese ? "学生姓名" : "Student Name";
    document.getElementById("dateDisplay").textContent = currentDate;
    
    document.getElementById("mainFeedbackContent").textContent = chinese ? 
        "无法加载反馈内容。请重新尝试或联系管理员。" : 
        "Unable to load feedback content. Please try again or contact administrator.";
    
    const homeworkIcon = document.getElementById("homeworkIcon");
    const homeworkStatusText = document.getElementById("homeworkStatusText");
    homeworkIcon.textContent = "-";
    homeworkIcon.className = "status-icon";
    homeworkStatusText.textContent = chinese ? "无法加载作业状态" : "Unable to load homework status";
    
    document.getElementById("performanceContent").textContent = chinese ? "无法加载表现评价" : "Unable to load performance evaluation";
    document.getElementById("developmentSkillsContent").textContent = chinese ? "无法加载技能评价" : "Unable to load skills evaluation";
    document.getElementById("behaviorContent").textContent = chinese ? "无法加载行为评价" : "Unable to load behavior evaluation";
    document.getElementById("knowledgeRetentionContent").textContent = chinese ? "无法加载知识掌握评价" : "Unable to load knowledge retention evaluation";
}

function formatDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString();
    
    try {
        const date = new Date(dateString);
        return chinese ? 
            date.toLocaleDateString('zh-CN') : 
            date.toLocaleDateString('en-US');
    } catch (error) {
        console.error("Error formatting date:", error);
        return new Date().toLocaleDateString();
    }
}