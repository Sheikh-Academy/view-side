/**
 * Student Exam Panel for Sheikh Academy
 * Features: Floating Timer (40s per question), Progress Tracker, 
 * Locked Answers, and Auto-generated Certificate.
 * [পয়েন্ট ৬, ১৩ - শিক্ষার্থীদের মডেল টেস্ট ইন্টারফেস]
 */

const StudentPanel = {
    examData: [],
    userAnswers: {},
    timeLeft: 0,
    timerInterval: null,
    totalQuestions: 0,

    /**
     * পরীক্ষা শুরু করা
     * @param {Array} questions - শাফলার থেকে আসা প্রশ্নের তালিকা
     */
    startExam: function(questions) {
        this.examData = questions;
        this.totalQuestions = questions.length;
        this.timeLeft = this.totalQuestions * 40; // প্রতি প্রশ্নে ৪০ সেকেন্ড
        this.userAnswers = {};

        this.renderLayout();
        this.startTimer();
    },

    /**
     * মূল লেআউট রেন্ডার করা
     */
    renderLayout: function() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="student-exam-container" style="background: #f4f7f6; min-height: 100vh; padding-bottom: 50px;">
                <!-- ভাসমান স্ট্যাটাস বার (সবসময় উপরে থাকবে) -->
                <div class="floating-status-bar" style="
                    position: sticky; top: 0; background: #2c3e50; color: white; 
                    padding: 15px; display: flex; justify-content: space-around; 
                    z-index: 2000; box-shadow: 0 2px 10px rgba(0,0,0,0.2); font-weight: bold;
                ">
                    <div id="exam-timer">সময় বাকি: ০০:০০</div>
                    <div id="question-progress">বাকি আছে: ${this.totalQuestions} টি</div>
                </div>

                <div class="exam-content" style="max-width: 800px; margin: 20px auto; padding: 0 15px;">
                    <div class="student-info" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #3498db;">
                        <h3 style="margin: 0;">মডেল টেস্ট: পদার্থবিজ্ঞান</h3>
                        <p style="margin: 5px 0; color: #666;">পরীক্ষার্থী: <span contenteditable="true">আপনার নাম লিখুন</span></p>
                    </div>

                    <div id="exam-questions-list">
                        ${this.renderQuestions()}
                    </div>

                    <button onclick="StudentPanel.submitExam()" id="submit-btn" style="
                        width: 100%; padding: 15px; background: #27ae60; color: white; 
                        border: none; border-radius: 8px; font-size: 18px; cursor: pointer; margin-top: 30px;
                    ">উত্তর জমা দিন</button>
                </div>
            </div>
        `;
    },

    /**
     * প্রশ্নসমূহ প্রদর্শন করা
     */
    renderQuestions: function() {
        return this.examData.map((q, i) => `
            <div class="exam-q-card" id="q-card-${i}" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <p style="font-weight: bold; margin-bottom: 15px;">${Utils.toBengaliNumber(i + 1)}. ${q.Question}</p>
                <div class="exam-options">
                    ${this.renderOption(i, 1, q.Option_1, 'ক')}
                    ${this.renderOption(i, 2, q.Option_2, 'খ')}
                    ${this.renderOption(i, 3, q.Option_3, 'গ')}
                    ${this.renderOption(i, 4, q.Option_4, 'ঘ')}
                </div>
            </div>
        `).join('');
    },

    /**
     * অপশন এবং নিচের বৃত্ত (ক,খ,গ,ঘ) রেন্ডার করা
     */
    renderOption: function(qIndex, optIndex, text, label) {
        return `
            <div class="opt-wrapper" onclick="StudentPanel.selectOption(${qIndex}, ${optIndex})" 
                 id="opt-${qIndex}-${optIndex}" 
                 style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer; padding: 8px; border-radius: 5px; border: 1px solid #eee;">
                <div class="opt-circle" style="
                    width: 24px; height: 24px; border: 2px solid #ddd; border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;
                ">${label}</div>
                <div class="opt-text">${text}</div>
            </div>
        `;
    },

    /**
     * অপশন সিলেক্ট করা (একবার দিলে লক হয়ে যাবে)
     */
    selectOption: function(qIndex, optIndex) {
        if (this.userAnswers[qIndex]) return; // লক লজিক

        this.userAnswers[qIndex] = optIndex;
        
        // ভিজ্যুয়াল আপডেট (সিলেক্টেড বৃত্ত ভরাট করা)
        const selectedOpt = document.getElementById(`opt-${qIndex}-${optIndex}`);
        selectedOpt.style.background = '#d4edda';
        selectedOpt.style.borderColor = '#28a745';
        selectedOpt.querySelector('.opt-circle').style.background = '#28a745';
        selectedOpt.querySelector('.opt-circle').style.color = 'white';

        // কতটি প্রশ্ন বাকি আছে আপডেট করা
        const solved = Object.keys(this.userAnswers).length;
        document.getElementById('question-progress').innerText = `বাকি আছে: ${Utils.toBengaliNumber(this.totalQuestions - solved)} টি`;
    },

    /**
     * টাইমার লজিক
     */
    startTimer: function() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            
            document.getElementById('exam-timer').innerText = `সময় বাকি: ${Utils.toBengaliNumber(minutes)}:${Utils.toBengaliNumber(seconds < 10 ? '0'+seconds : seconds)}`;

            if (this.timeLeft <= 0) {
                this.submitExam();
            }
        }, 1000);
    },

    /**
     * রেজাল্ট সাবমিট এবং সার্টিফিকেট দেখানো
     */
    submitExam: function() {
        clearInterval(this.timerInterval);
        let score = 0;
        this.examData.forEach((q, i) => {
            if (this.userAnswers[i] && this.userAnswers[i].toString() === q.Correct_Answer.toString()) {
                score++;
            }
        });

        this.showCertificate(score);
    },

    /**
     * সিম্পল সার্টিফিকেট ইন্টারফেস
     */
    showCertificate: function(score) {
        const app = document.getElementById('app');
        const percentage = Math.round((score / this.totalQuestions) * 100);
        
        app.innerHTML = `
            <div class="certificate-overlay" style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #2c3e50; padding: 20px;">
                <div class="certificate-card" style="background: white; padding: 40px; border-radius: 15px; text-align: center; max-width: 600px; border: 10px double #f1c40f;">
                    <h1 style="color: #f1c40f; margin-bottom: 10px;">অভিনন্দন!</h1>
                    <p style="font-size: 20px;">আপনার পরীক্ষা সফলভাবে সম্পন্ন হয়েছে।</p>
                    <hr style="margin: 20px 0;">
                    <div style="font-size: 24px; margin-bottom: 20px;">
                        প্রাপ্ত নম্বর: <strong>${Utils.toBengaliNumber(score)}</strong> / ${Utils.toBengaliNumber(this.totalQuestions)}<br>
                        সাফল্যের হার: <strong>${Utils.toBengaliNumber(percentage)}%</strong>
                    </div>
                    <p style="font-style: italic; color: #666;">শেখ একাডেমি - আপনার মেধা বিকাশের সঙ্গী</p>
                    <button onclick="location.reload()" style="margin-top: 30px; padding: 10px 25px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">আবার চেষ্টা করুন</button>
                </div>
            </div>
        `;
    }
};

window.StudentPanel = StudentPanel;
