/**
 * Teacher Panel Logic for Sheikh Academy
 * Features: Live Preview, Question Selection, Dynamic Filtering, and Sidebar Integration.
 * [পয়েন্ট ১৩ - শিক্ষকদের জন্য প্রশ্ন তৈরির মূল প্যানেল]
 */

const TeacherPanel = {
    allQuestions: [],
    selectedQuestions: [],
    currentSubject: 'Physics', // ডিফল্ট বিষয়

    /**
     * প্যানেল ইনিশিয়ালাইজ করা
     */
    async init() {
        // ১. ডাটাবেস থেকে প্রশ্ন লোড করা
        this.allQuestions = await DBHandler.getAllQuestions();
        
        // ২. ইউআই রেন্ডার করা
        this.renderLayout();
        this.setupEventListeners();
        
        // ৩. সাইডবার সেটিংস লোড করা
        SidebarControls.init('sidebar-container');
    },

    /**
     * মূল লেআউট তৈরি (বাম পাশে সেটিংস, মাঝখানে প্রিভিউ)
     */
    renderLayout() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="editor-app-container">
                <!-- বাম পাশে ফিল্টার ও প্রশ্ন সিলেকশন প্যানেল -->
                <div class="question-selector-panel" style="width: 350px; border-right: 1px solid #ddd; display: flex; flex-direction: column;">
                    <div class="filter-section" style="padding: 15px; background: #f8f9fa; border-bottom: 1px solid #ddd;">
                        <select id="chapter-filter" onchange="TeacherPanel.handleFilterChange()" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                            <option value="">সকল অধ্যায়</option>
                            ${this.getChapterOptions()}
                        </select>
                        <input type="text" id="search-tag" placeholder="ট্যাগ বা কি-ওয়ার্ড দিয়ে খুঁজুন..." oninput="TeacherPanel.handleFilterChange()" style="width: 100%; padding: 8px;">
                    </div>
                    <div id="question-list" style="flex: 1; overflow-y: auto; padding: 10px;">
                        <!-- এখানে ফিল্টার করা প্রশ্নের তালিকা আসবে -->
                    </div>
                </div>

                <!-- মাঝখানে বোর্ড স্টাইল লাইভ প্রিভিউ -->
                <div class="main-editor-area" style="flex: 1; overflow-y: auto; background: #525659; padding: 40px;">
                    <div id="board-paper" class="board-paper">
                        <!-- পরীক্ষার হেডার (পয়েন্ট ১৯) -->
                        <div class="exam-header">
                            <h2 contenteditable="true" class="header-school">প্রতিষ্ঠানের নাম লিখুন</h2>
                            <p contenteditable="true">বার্ষিক পরীক্ষা - ২০২৪</p>
                            <div class="header-meta">
                                <span contenteditable="true">বিষয়: পদার্থবিজ্ঞান</span>
                                <span contenteditable="true">সময়: ২ ঘণ্টা ৩০ মিনিট</span>
                                <span contenteditable="true">পূর্ণমান: ১০০</span>
                            </div>
                        </div>

                        <!-- প্রশ্নের কন্টেইনার (পয়েন্ট ২২) -->
                        <div id="questions-display" class="questions-container">
                            <p style="color: #999; text-align: center; margin-top: 50px;">বাম পাশ থেকে প্রশ্ন সিলেক্ট করুন...</p>
                        </div>

                        <!-- ওএমআর সেকশন (পয়েন্ট ১৭) -->
                        <div id="omr-section"></div>
                    </div>
                </div>

                <!-- ডান পাশে সেটিংস সাইডবার (SidebarControls.js থেকে আসবে) -->
                <div id="sidebar-container"></div>
            </div>
        `;
    },

    /**
     * অধ্যায়ের ড্রপডাউন তৈরি করা
     */
    getChapterOptions() {
        const chapters = FilterEngine.getUniqueValues(this.allQuestions, 'Chapter');
        return chapters.map(c => `<option value="${c}">${c}</option>`).join('');
    },

    /**
     * ফিল্টার পরিবর্তন হলে প্রশ্নের তালিকা আপডেট করা
     */
    handleFilterChange() {
        const chapter = document.getElementById('chapter-filter').value;
        const keyword = document.getElementById('search-tag').value;
        
        let filtered = FilterEngine.filter(this.allQuestions, { chapter: chapter });
        if (keyword) {
            filtered = FilterEngine.searchByTag(filtered, keyword);
        }

        this.renderQuestionList(filtered);
    },

    /**
     * বাম পাশের তালিকায় প্রশ্নগুলো দেখানো
     */
    renderQuestionList(list) {
        const listContainer = document.getElementById('question-list');
        listContainer.innerHTML = list.map(q => `
            <div class="q-card" style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px; cursor: pointer; background: #fff; border-radius: 4px;" 
                 onclick="TeacherPanel.toggleQuestionSelection('${q.SL}')">
                <small style="color: #3498db;">${q.Chapter}</small>
                <p style="margin: 5px 0; font-size: 14px;">${q.Question || q.Stimulus.substring(0, 50) + '...'}</p>
                <input type="checkbox" ${this.selectedQuestions.find(sq => sq.SL === q.SL) ? 'checked' : ''}> যুক্ত করুন
            </div>
        `).join('');
    },

    /**
     * প্রশ্ন সিলেক্ট বা রিমুভ করা এবং প্রিভিউ আপডেট করা
     */
    toggleQuestionSelection(sl) {
        const question = this.allQuestions.find(q => q.SL === sl);
        const index = this.selectedQuestions.findIndex(sq => sq.SL === sl);

        if (index > -1) {
            this.selectedQuestions.splice(index, 1);
        } else {
            this.selectedQuestions.push(question);
        }

        this.updateLivePreview();
        this.handleFilterChange(); // লিস্টের চেকবক্স আপডেট করার জন্য
    },

    /**
     * লাইভ প্রিভিউ (সাদা পাতা) আপডেট করা
     */
    updateLivePreview() {
        const display = document.getElementById('questions-display');
        if (this.selectedQuestions.length === 0) {
            display.innerHTML = '<p style="color: #999; text-align: center;">কোনো প্রশ্ন সিলেক্ট করা নেই।</p>';
            return;
        }

        let html = '';
        this.selectedQuestions.forEach((q, i) => {
            if (q.Type === 'MCQ') {
                html += MCQLogic.renderMCQ(q, i + 1);
            } else {
                html += CreativeLogic.renderCreativeSet(q, i + 1);
            }
        });

        display.innerHTML = html;

        // প্রশ্ন সংখ্যার সাথে ওএমআর আপডেট করা (পয়েন্ট ১৭)
        if (this.selectedQuestions.some(q => q.Type === 'MCQ')) {
            const mcqCount = this.selectedQuestions.filter(q => q.Type === 'MCQ').length;
            OMRGenerator.generate(mcqCount, {
                schoolName: document.querySelector('.header-school').innerText,
                className: 'দশম',
                subject: 'পদার্থবিজ্ঞান'
            });
        } else {
            document.getElementById('omr-section').innerHTML = '';
        }
    },

    /**
     * ইভেন্ট লিসেনার সেটআপ
     */
    setupEventListeners() {
        // এখানে অটো-সেভ বা ড্রাফট লজিক যুক্ত হবে (পয়েন্ট ৯)
        document.addEventListener('input', () => {
            const content = document.getElementById('board-paper').innerHTML;
            DBHandler.saveDraft(content);
        });
    }
};

// অ্যাপ লোড হলে ইনিশিয়ালাইজ করা
window.onload = () => TeacherPanel.init();
