class AssessmentService {
  // PHQ-9 (Patient Health Questionnaire-9) scoring
  static calculatePHQ9Score(answers) {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);

    let category;
    let interpretation;

    if (totalScore <= 4) {
      category = 'minimal';
      interpretation = 'Minimal depression';
    } else if (totalScore <= 9) {
      category = 'mild';
      interpretation = 'Mild depression';
    } else if (totalScore <= 14) {
      category = 'moderate';
      interpretation = 'Moderate depression';
    } else if (totalScore <= 19) {
      category = 'moderately-severe';
      interpretation = 'Moderately severe depression';
    } else {
      category = 'severe';
      interpretation = 'Severe depression';
    }

    return {
      totalScore,
      category,
      interpretation,
      severity: this.getSeverityLevel(totalScore, 'phq9')
    };
  }

  // GAD-7 (Generalized Anxiety Disorder-7) scoring
  static calculateGAD7Score(answers) {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);

    let category;
    let interpretation;

    if (totalScore <= 4) {
      category = 'minimal';
      interpretation = 'Minimal anxiety';
    } else if (totalScore <= 9) {
      category = 'mild';
      interpretation = 'Mild anxiety';
    } else if (totalScore <= 14) {
      category = 'moderate';
      interpretation = 'Moderate anxiety';
    } else {
      category = 'severe';
      interpretation = 'Severe anxiety';
    }

    return {
      totalScore,
      category,
      interpretation,
      severity: this.getSeverityLevel(totalScore, 'gad7')
    };
  }

  // Get severity level
  static getSeverityLevel(score, type) {
    if (type === 'phq9') {
      if (score <= 4) return 'none';
      if (score <= 9) return 'mild';
      if (score <= 14) return 'moderate';
      if (score <= 19) return 'moderately-severe';
      return 'severe';
    } else if (type === 'gad7') {
      if (score <= 4) return 'none';
      if (score <= 9) return 'mild';
      if (score <= 14) return 'moderate';
      return 'severe';
    }
    return 'unknown';
  }

  // Validate assessment answers
  static validateAnswers(type, answers) {
    const questionCount = type === 'PHQ-9' ? 9 : 7;

    if (answers.length !== questionCount) {
      throw new Error(`Invalid number of answers. Expected ${questionCount}, got ${answers.length}`);
    }

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      if (typeof answer.score !== 'number' || answer.score < 0 || answer.score > 3) {
        throw new Error(`Invalid score for question ${i + 1}. Must be 0-3`);
      }
    }

    return true;
  }

  // Get assessment questions
  static getQuestions(type) {
    if (type === 'PHQ-9') {
      return [
        'Little interest or pleasure in doing things',
        'Feeling down, depressed, or hopeless',
        'Trouble falling or staying asleep, or sleeping too much',
        'Feeling tired or having little energy',
        'Poor appetite or overeating',
        'Feeling bad about yourself or that you are a failure',
        'Trouble concentrating on things',
        'Moving or speaking so slowly that others notice',
        'Thoughts that you would be better off dead'
      ];
    } else if (type === 'GAD-7') {
      return [
        'Feeling nervous, anxious, or on edge',
        'Not being able to stop or control worrying',
        'Worrying too much about different things',
        'Trouble relaxing',
        'Being so restless that it is hard to sit still',
        'Becoming easily annoyed or irritable',
        'Feeling afraid as if something awful might happen'
      ];
    }

    throw new Error('Invalid assessment type');
  }
}

module.exports = AssessmentService;