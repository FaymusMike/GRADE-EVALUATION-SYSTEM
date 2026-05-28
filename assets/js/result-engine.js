// assets/js/result-engine.js - Grade Computation Engine
const GradeEngine = {
    gradingScale: [
        { min: 70, max: 100, grade: 'A', points: 5.0 },
        { min: 60, max: 69, grade: 'B', points: 4.0 },
        { min: 50, max: 59, grade: 'C', points: 3.0 },
        { min: 45, max: 49, grade: 'D', points: 2.0 },
        { min: 40, max: 44, grade: 'E', points: 1.0 },
        { min: 0, max: 39, grade: 'F', points: 0.0 }
    ],
    
    calculateGrade(totalScore) {
        const scale = this.gradingScale.find(s => totalScore >= s.min && totalScore <= s.max);
        return scale || { grade: 'F', points: 0.0 };
    },
    
    calculateGPA(results, courses) {
        let totalPoints = 0;
        let totalCredits = 0;
        
        results.forEach(result => {
            const course = courses.find(c => c.id === result.courseId);
            if (course && result.status === 'published') {
                const gradeInfo = this.calculateGrade(result.totalScore);
                totalPoints += gradeInfo.points * course.creditUnit;
                totalCredits += course.creditUnit;
            }
        });
        
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    },
    
    calculateCGPA(allSemesters) {
        let totalPoints = 0;
        let totalCredits = 0;
        
        allSemesters.forEach(semester => {
            semester.results.forEach(result => {
                if (result.status === 'published') {
                    totalPoints += result.gradePoints * result.creditUnit;
                    totalCredits += result.creditUnit;
                }
            });
        });
        
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    },
    
    computeResultScores(scores) {
        const ca = parseFloat(scores.ca) || 0;
        const assignment = parseFloat(scores.assignment) || 0;
        const midterm = parseFloat(scores.midterm) || 0;
        const exam = parseFloat(scores.exam) || 0;
        
        const total = ca + assignment + midterm + exam;
        const isValid = total <= 100 && ca <= 30 && assignment <= 10 && midterm <= 20 && exam <= 70;
        
        return { total, isValid };
    },
    
    validateScores(scores) {
        const errors = [];
        if (scores.ca < 0 || scores.ca > 30) errors.push('CA score must be between 0-30');
        if (scores.assignment < 0 || scores.assignment > 10) errors.push('Assignment score must be between 0-10');
        if (scores.midterm < 0 || scores.midterm > 20) errors.push('Midterm score must be between 0-20');
        if (scores.exam < 0 || scores.exam > 70) errors.push('Exam score must be between 0-70');
        return errors;
    },
    
    processBatchResults(resultsData, courses) {
        return resultsData.map(result => {
            const course = courses.find(c => c.id === result.courseId);
            const gradeInfo = this.calculateGrade(result.totalScore);
            return {
                ...result,
                grade: gradeInfo.grade,
                gradePoints: gradeInfo.points,
                creditUnit: course?.creditUnit || 0,
                status: 'pending'
            };
        });
    },
    
    generateTranscript(studentId, allResults, courses) {
        const student = Storage.findOne('students', s => s.id === studentId);
        const semesters = this.groupResultsBySemester(allResults);
        
        let cumulativePoints = 0;
        let cumulativeCredits = 0;
        
        const transcriptData = {
            student,
            semesters: semesters.map(semester => {
                let semesterPoints = 0;
                let semesterCredits = 0;
                
                const courses_results = semester.results.map(result => {
                    const course = courses.find(c => c.id === result.courseId);
                    const points = result.gradePoints * (course?.creditUnit || 0);
                    semesterPoints += points;
                    semesterCredits += course?.creditUnit || 0;
                    cumulativePoints += points;
                    cumulativeCredits += course?.creditUnit || 0;
                    
                    return {
                        courseCode: course?.code,
                        courseTitle: course?.title,
                        creditUnit: course?.creditUnit,
                        score: result.totalScore,
                        grade: result.grade,
                        gradePoints: result.gradePoints
                    };
                });
                
                return {
                    semester: semester.name,
                    results: courses_results,
                    semesterGPA: semesterCredits > 0 ? (semesterPoints / semesterCredits).toFixed(2) : 0,
                    semesterPoints,
                    semesterCredits
                };
            }),
            cgpa: cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits).toFixed(2) : 0,
            totalPoints: cumulativePoints,
            totalCredits: cumulativeCredits,
            classification: this.calculateClassification(cumulativePoints / cumulativeCredits)
        };
        
        return transcriptData;
    },
    
    calculateClassification(cgpa) {
        if (cgpa >= 4.5) return 'First Class Honours';
        if (cgpa >= 3.5) return 'Second Class Honours (Upper)';
        if (cgpa >= 2.5) return 'Second Class Honours (Lower)';
        if (cgpa >= 1.5) return 'Third Class Honours';
        return 'Pass';
    },
    
    groupResultsBySemester(results) {
        const grouped = {};
        results.forEach(result => {
            if (!grouped[result.semester]) {
                grouped[result.semester] = [];
            }
            grouped[result.semester].push(result);
        });
        
        return Object.entries(grouped).map(([name, results]) => ({ name, results }));
    }
};