// const BASE_URL = 'http://localhost:3000/api/';
const BASE_URL = 'https://backend4.sharemyworks.com/api/';
const chinese = window.location.href.includes("cn");
let currentSurveyId = null;

document.addEventListener('DOMContentLoaded', function() {
    const url = new URL(window.location.href);
    const success = url.searchParams.get("success");

    if (success) {
        showThankYouMessage();
    } else {
        initializeSurvey();
    }
});

function showThankYouMessage() {
    // Hide survey content
    document.querySelector('.classic-view').innerHTML = `
        <div class="text-center py-8">
            <h2 class="display-4 mb-4">${chinese ? '感谢您的反馈！' : 'Thank you for your response!'}</h2>
            <p class="lead mb-0">${chinese ? '您的反馈对我们非常重要。' : 'Your feedback is valuable to us.'}</p>
        </div>
    `;
}

async function initializeSurvey() {
    const url = new URL(window.location.href);
    const accountId = url.searchParams.get("studentId");
    const courseId = url.searchParams.get("courseId");

    if (!accountId || !courseId) {
        console.error('Missing required parameters:', { accountId, courseId });
        showToast(chinese ? '缺少必要参数，请联系管理人员！' : 'Missing required parameters! Please contact management team', 'error');
        return; 
    }
    
    // generateRatingButtons();
    generateRatingElements();
    setupRatingHandlers();
    setupFormValidation();
    
    // Check if there's an existing survey
    try {
        const surveyId = await fetchSurveyId(accountId, courseId);
        if (surveyId|| surveyId != null) {
            currentSurveyId = surveyId;
            await loadExistingSurvey(surveyId);
        }
    } catch (error) {
        console.error('Error initializing survey:', error);
        showToast(chinese ? '加载问卷失败！' : 'Failed to load survey!', 'error');
    }
}

function generateRatingElements() {
    document.querySelectorAll('.survey-item').forEach(item => {
        const container = item.querySelector('.rating-container');
        
        // Generate buttons for desktop
        const buttonsContainer = container.querySelector('.rating-buttons');
        for (let i = 1; i <= 10; i++) {
            const button = document.createElement('div');
            button.className = 'rating-button';
            button.setAttribute('data-value', i);
            button.textContent = i;
            buttonsContainer.appendChild(button);
        }

        // Generate slider for mobile
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'rating-slider-container';
        
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'rating-value-display';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'rating-slider';
        slider.min = '1';
        slider.max = '10';
        slider.value = '5';
        slider.step = '1';

        // Create tick marks container
        //const ticksContainer = document.createElement('div');
        //ticksContainer.className = 'slider-ticks';

        // Add tick marks with numbers
        // for (let i = 1; i <= 10; i++) {
        //     const tick = document.createElement('div');
        //     tick.className = 'tick';
        //     const tickLabel = document.createElement('span');
        //     tickLabel.className = 'tick-label';
        //     tickLabel.textContent = i;
        //     tick.appendChild(tickLabel);
        //     ticksContainer.appendChild(tick);
        // }

        sliderContainer.appendChild(valueDisplay);
        sliderContainer.appendChild(slider);
        //sliderContainer.appendChild(ticksContainer);
        container.appendChild(sliderContainer);

        // Update value display initially
        valueDisplay.textContent = slider.value;
    });
}

function generateRatingButtons() {
    document.querySelectorAll('.rating-buttons').forEach(container => {
        for (let i = 1; i <= 10; i++) {
            const button = document.createElement('div');
            button.className = 'rating-button';
            button.setAttribute('data-value', i);
            button.textContent = i;
            container.appendChild(button);
        }
    });
}

function setupRatingHandlers() {
    // document.querySelectorAll('.rating-button').forEach(button => {
    //     button.addEventListener('click', function() {
    //         const container = this.closest('.rating-container');
    //         container.querySelectorAll('.rating-button').forEach(btn => {
    //             btn.classList.remove('selected');
    //         });
    //         this.classList.add('selected');
            
    //         const surveyItem = this.closest('.survey-item');
    //         clearError(surveyItem);
    //     });
    // });

        // Desktop button handlers
        document.querySelectorAll('.rating-button').forEach(button => {
            button.addEventListener('click', function() {
                const surveyItem = this.closest('.survey-item');
                const value = this.getAttribute('data-value');
                updateRating(surveyItem, value);
            });
        });
    
        // Mobile slider handlers
        document.querySelectorAll('.rating-slider').forEach(slider => {
            slider.addEventListener('input', function() {
                const surveyItem = this.closest('.survey-item');
                updateRating(surveyItem, this.value);
            });
        });
}

function updateRating(surveyItem, value) {
    // Update buttons
    surveyItem.querySelectorAll('.rating-button').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-value') === value.toString()) {
            btn.classList.add('selected');
        }
    });

    // Update slider
    const slider = surveyItem.querySelector('.rating-slider');
    if (slider) {
        slider.value = value;
        const valueDisplay = surveyItem.querySelector('.rating-value-display');
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
    }
    clearError(surveyItem);
}

function setupFormValidation() {
    // Add error styles
    addErrorStyles();
    
    // Form submission handler
    document.getElementById('commentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        clearAllErrors();
        
        const ratings = validateAndCollectRatings();
        if (!ratings) return;

        const surveyData = {
            courseInterestRating: parseInt(ratings.interest),
            skillImprovementRating: parseInt(ratings.skill_improvement),
            difficultyRating: parseInt(ratings.difficulty_appropriateness),
            teacherSatisfactionRating: parseInt(ratings.teaching_satisfaction),
            registrationClarityRating: parseInt(ratings.registration_clarity),
            customerServiceRating: parseInt(ratings.customer_service),
            overallSatisfactionRating: parseInt(ratings.overall_satisfaction),
            improvementSuggestions: document.getElementById('comment').value,
            accountId: new URL(window.location.href).searchParams.get("studentId"),
            courseId: new URL(window.location.href).searchParams.get("courseId"),
            lastUpdateAt: new Date()
        };


        try {
            console.log('Survey data:', surveyData);
            if (currentSurveyId && currentSurveyId != null) {
                // Update existing survey
                await updateSurvey(currentSurveyId, surveyData);
                showToast(chinese ? '问卷更新成功！' : 'Survey updated successfully!', 'success');
            } else {
                // Create new survey
                await submitSurvey(surveyData);
                showToast(chinese ? '问卷提交成功！' : 'Survey submitted successfully!', 'success');
            }

            const url = new URL(window.location.href);
            url.searchParams.set('success', 'true');
            window.location.href = url.toString();

        } catch (error) {
            console.error('Survey submission error:', error);
            showToast(chinese ? '问卷提交失败！' : 'Failed to submit survey!', 'error');
        }
    });
}

async function fetchSurveyId(accountId, courseId) {
    const response = await fetch(`${BASE_URL}Surveys/findSurvey?accountId=${accountId}&courseId=${courseId}`);
    console.log('fetching survey id');
    console.log(response);
    const data = await response.json();
    console.log('data:', data);
    currentSurveyId = data.surveyId;
    return data.surveyId;
}

async function loadExistingSurvey(surveyId) {
    const response = await fetch(`${BASE_URL}Surveys/${surveyId}`);
    const survey = await response.json();
    
    // Fill in existing ratings
    Object.entries({
        'interest': survey.courseInterestRating,
        'skill_improvement': survey.skillImprovementRating,
        'difficulty_appropriateness': survey.difficultyRating,
        'teaching_satisfaction': survey.teacherSatisfactionRating,
        'registration_clarity': survey.registrationClarityRating,
        'customer_service': survey.customerServiceRating,
        'overall_satisfaction': survey.overallSatisfactionRating
    }).forEach(([question, rating]) => {
        if (rating) {
            // const surveyItem = document.querySelector(`[data-question="${question}"]`);
            // const button = surveyItem.querySelector(`[data-value="${rating}"]`);
            // if (button) button.classList.add('selected');
            const surveyItem = document.querySelector(`[data-question="${question}"]`);
            if (surveyItem) {
                updateRating(surveyItem, rating);
            }
        }
    });

    // Fill in comments
    if (survey.improvementSuggestions) {
        document.getElementById('comment').value = survey.improvementSuggestions;
    }
}

async function submitSurvey(surveyData) {
    const response = await fetch(`${BASE_URL}Surveys`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
    });

    if (!response.ok) {
        throw new Error('Failed to submit survey');
    }
    const result = await response.json();
    currentSurveyId = result.id; // Save the new survey ID
    return result;

}

async function updateSurvey(surveyId, surveyData) {
    const response = await fetch(`${BASE_URL}Surveys/${surveyId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
    });
    if (!response.ok) {
        throw new Error('Failed to submit survey');
    }
    return response.json();
}

// Helper functions
function validateAndCollectRatings() {
    const ratings = {};
    let hasErrors = false;
    
    document.querySelectorAll('.survey-item').forEach(item => {
        const question = item.getAttribute('data-question');
        const selected = item.querySelector('.rating-button.selected');
        const slider = item.querySelector('.rating-slider');
        
        if (!selected && (!slider || !slider.value)) {
            hasErrors = true;
            showError(item);
        } else {
            // ratings[question] = selected.getAttribute('data-value');
            ratings[question] = selected ? selected.getAttribute('data-value') : slider.value;
        }
    });

    if (hasErrors) {
        const firstError = document.querySelector('.survey-item.has-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return null;
    }

    return ratings;
}

function showError(item) {
    item.classList.add('has-error');
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = chinese ? '请为此问题选择评分' : 'Please select a rating for this question';
    item.querySelector('.rating-container').after(errorMsg);
}

function clearError(item) {
    item.classList.remove('has-error');
    const errorMsg = item.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());
    document.querySelectorAll('.survey-item').forEach(item => {
        item.classList.remove('has-error');
    });
}

function addErrorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
    `;
    document.head.appendChild(style);
}

function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: 'right',
        style: {
            background: type === 'success' ? "#4caf50" : "#dc3545"
        },
    }).showToast();
}