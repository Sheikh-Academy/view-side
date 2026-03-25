/**
 * Suggestion View for Students
 * Features: Chapter-based filtering, Important Question (Suggestion) Display, 
 * Shows only the correct answer (hides distractions).
 * [পয়েন্ট ১৪ - সাজেশন পেজ লেআউট]
 */

const SuggestionView = {
    allQuestions: [],
    selectedChapter: null,

    /**
     * সাজেশন পেজ ইনিশিয়ালাইজ করা
     */
    async init() {
        // ১. ডাটাবেস থেকে প্রশ্ন লোড করা
        this.allQuestions = await DBHandler.getAllQuestions();
        this.renderLayout();
    },

    /**
     * মূল লেআউট রেন্ডার করা (শ্রেণি ও বিষয় নির্বাচন)
     */
    renderLayout: function() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="suggestion-container" style="background: #fdfdfd; min-height: 100vh; padding: 20px;">
                <div class="suggestion-header" style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px;">
                    <h2 style="color: #2c3e50;">🎯 বিশেষ সাজেশন বোর্ড</h2>
                    <p style="color: #7f8c8d;">এখানে শুধু গুরুত্বপূর্ণ প্রশ্ন ও তাদের সঠিক উত্তর দেওয়া হয়েছে।</p>
                    
                    <div class="selector-controls" style="margin-top: 20px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                        <select id="suggest-class" style="padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                            <option value="10">দশম শ্রেণি</option>
                            <option value="9">নবম শ্রেণি</option>
                        </select>
                        <select id="suggest-subject" style="padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                            <option value="Physics">পদার্থবিজ্ঞান</option>
                            <option value="Chemistry">রসায়ন</option>
                        </select>
                        <button onclick="SuggestionView.loadChapters()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">অধ্যায়গুলো দেখুন</button>
                    </div>
                </div>

                <!-- অধ্যায় বাটন কন্টেইনার (পয়েন্ট ১৪ - ইউনিক বাটন) -->
                <div id="chapter-buttons-area" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 30px;">
                    <!-- বাটনগুলো এখানে ডাইনামিকভাবে আসবে -->
                </div>

                <!-- প্রশ্নের তালিকা প্রদর্শন এলাকা -->
                <div id="suggestion-list-area" style="max-width: 900px; margin: 0 auto;">
                    <div style="text-align: center; color: #ccc; margin-top: 50px;">
                        <p>উপরের যেকোনো অধ্যায় সিলেক্ট করুন...</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * ডাটা থেকে ইউনিক অধ্যায় বের করে বাটন তৈরি করা
     */
    loadChapters: function() {
        const questions = this.allQuestions;
        // ইউনিক অধ্যায় বের করা (FilterEngine ব্যবহার করে)
        const chapters = FilterEngine.getUniqueValues(questions, 'Chapter');
        
        const btnArea = document.getElementById('chapter-buttons-area');
        btnArea.innerHTML = chapters.map(ch => `
            <button onclick="SuggestionView.showChapterQuestions('${ch}')" class="chapter-btn" style="
                padding: 12px 20px; background: #fff; border: 2px solid #3498db; 
                color: #3498db; border-radius: 25px; cursor: pointer; font-weight: bold;
                transition: all 0.3s;
            " onmouseover="this.style.background='#3498db'; this.style.color='#fff';" 
               onmouseout="this.style.background='#fff'; this.style.color='#3498db';">
                ${ch}
            </button>
        `).join('');

        document.getElementById('suggestion-list-area').innerHTML = '<p style="text-align:center;">অধ্যায় লোড হয়েছে। প্রশ্ন দেখতে বাটনে ক্লিক করুন।</p>';
    },

    /**
     * নির্দিষ্ট অধ্যায়ের প্রশ্ন ও উত্তর দেখানো (বাকি অপশন ছাড়া)
     */
    showChapterQuestions: function(chapterName) {
        this.selectedChapter = chapterName;
        
        // শুধু গুরুত্বপূর্ণ (সাজেশন ট্যাগ যুক্ত) এবং নির্দিষ্ট অধ্যায়ের প্রশ্ন ফিল্টার করা
        const filtered = this.allQuestions.filter(q => 
            q.Chapter === chapterName && 
            q.Type === 'MCQ' && 
            (q.Tags && q.Tags.includes('Important'))
        );

        const listArea = document.getElementById('suggestion-list-area');
        
        if (filtered.length === 0) {
            listArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #e74c3c;">এই অধ্যায়ে এখনো কোনো সাজেশন যুক্ত করা হয়নি।</div>`;
            return;
        }

        listArea.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #2c3e50; border-left: 5px solid #2ecc71; padding-left: 10px;">
                ${chapterName} - এর গুরুত্বপূর্ণ প্রশ্নোত্তর
            </h3>
            ${filtered.map((q, i) => `
                <div class="suggest-card" style="
                    background: white; padding: 20px; border-radius: 10px; 
                    margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    border: 1px solid #eee;
                ">
                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">
                        ${Utils.toBengaliNumber(i + 1)}. ${q.Question}
                    </div>
                    <div class="correct-answer-box" style="
                        background: #eafaf1; color: #27ae60; padding: 10px 15px; 
                        border-radius: 5px; display: inline-block; font-weight: bold;
                    ">
                        ✅ উত্তর: ${this.getCorrectAnswerText(q)}
                    </div>
                </div>
            `).join('')}
        `;
    },

    /**
     * সঠিক উত্তরের ইনডেক্স থেকে টেক্সট বের করা
     */
    getCorrectAnswerText: function(q) {
        const correctIdx = q.Correct_Answer; // ধরি ১, ২, ৩ বা ৪
        const optionLabel = `Option_${correctIdx}`;
        return q[optionLabel] || "তথ্য পাওয়া যায়নি";
    }
};

window.SuggestionView = SuggestionView;
