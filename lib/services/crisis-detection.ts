// Crisis detection service for identifying users in need of immediate help

export interface CrisisDetectionResult {
    isCrisis: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    keywords: string[];
    message: string;
}

const CRISIS_KEYWORDS = {
    critical: [
        'suicide',
        'kill myself',
        'end my life',
        'want to die',
        'better off dead',
        'no reason to live',
    ],
    high: [
        'self harm',
        'hurt myself',
        'cutting',
        'overdose',
        'can\'t go on',
        'giving up',
    ],
    medium: [
        'hopeless',
        'worthless',
        'burden',
        'everyone would be better without me',
        'can\'t take it anymore',
    ],
};

export function detectCrisis(text: string): CrisisDetectionResult {
    const lowerText = text.toLowerCase();
    const foundKeywords: string[] = [];
    let severity: CrisisDetectionResult['severity'] = 'low';
    let isCrisis = false;

    // Check critical keywords
    for (const keyword of CRISIS_KEYWORDS.critical) {
        if (lowerText.includes(keyword)) {
            foundKeywords.push(keyword);
            severity = 'critical';
            isCrisis = true;
        }
    }

    // Check high-risk keywords
    if (severity !== 'critical') {
        for (const keyword of CRISIS_KEYWORDS.high) {
            if (lowerText.includes(keyword)) {
                foundKeywords.push(keyword);
                severity = 'high';
                isCrisis = true;
            }
        }
    }

    // Check medium-risk keywords
    if (severity === 'low') {
        for (const keyword of CRISIS_KEYWORDS.medium) {
            if (lowerText.includes(keyword)) {
                foundKeywords.push(keyword);
                severity = 'medium';
                isCrisis = true;
            }
        }
    }

    let message = '';
    if (isCrisis) {
        if (severity === 'critical' || severity === 'high') {
            message = 'We detected that you may be in crisis. Please reach out to a crisis helpline immediately. You are not alone, and help is available.';
        } else {
            message = 'It seems like you might be going through a difficult time. Consider talking to a mental health professional or reaching out to a support helpline.';
        }
    }

    return {
        isCrisis,
        severity,
        keywords: foundKeywords,
        message,
    };
}

export const CRISIS_RESOURCES = [
    {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        description: '24/7 free and confidential support',
        url: 'https://988lifeline.org/',
    },
    {
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        description: '24/7 support via text message',
        url: 'https://www.crisistextline.org/',
    },
    {
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        description: 'Treatment referral and information service',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
    },
    {
        name: 'International Association for Suicide Prevention',
        phone: 'Varies by country',
        description: 'Find crisis centers around the world',
        url: 'https://www.iasp.info/resources/Crisis_Centres/',
    },
];

