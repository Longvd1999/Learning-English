// App State
let currentTab = 'dict'; // default starting tab
let currentPracticeTopic = 'lesson1'; // default topic
let currentScore = 0;
let answeredQuestionsCount = 0;
let correctAnswersCount = 0;
let correctIpaAnswersCount = 0; // For Pronunciation Pro Badge
let streak = 0;
let currentQuestionIndex = 0;
let userAnswers = []; // Track answered questions details
let selectedWords = []; // For word ordering questions
let savedVocabList = []; // Vocabulary Notebook
let lessonScores = {}; // Holds high scores for Bài 1 - Bài 10
let currentLessonCorrectAnswers = 0; // Holds current run correct answers count

// Sound Sorting Game State
let currentGameWord = null;
let usedGameWordIndices = []; // Track used game words to avoid repeat

// Infinite Question Pool State (grammar & ipa topics)
let shuffledQuestionPool = []; // shuffled indices for current topic
let poolPosition = 0;          // current position in shuffled pool

// Audio context helper for synthesized UK/US speech
let ukVoice = null;
let usVoice = null;

// Dictionary Cache
let activeWordData = null; // Currently searched word detail

// Dynamic IPA Sound Database (44 Sounds)
const allIpaSounds = [
    // 12 Monophthongs (Nguyên âm đơn)
    {
        symbol: "/i:/",
        name: "Nguyên âm dài (Long Vowel)",
        type: "long-vowel",
        voicing: "voiced",
        description: [
            "Mở miệng hẹp sang hai bên giống như đang mỉm cười.",
            "Lưỡi nâng cao, hướng về phía trước miệng.",
            "Dây thanh quản rung mạnh khi phát âm."
        ],
        examples: [
            { word: "see", ipa: "/siː/", text: "Nhìn thấy" },
            { word: "meet", ipa: "/miːt/", text: "Gặp gỡ" },
            { word: "we", ipa: "/wiː/", text: "Chúng tôi" }
        ]
    },
    {
        symbol: "/ɪ/",
        name: "Nguyên âm ngắn (Short Vowel)",
        type: "short-vowel",
        voicing: "voiced",
        description: [
            "Miệng mở rộng hơn so với âm /i:/ một chút.",
            "Lưỡi hạ thấp xuống một chút và kéo về phía sau.",
            "Phát âm cực kỳ nhanh và dứt khoát."
        ],
        examples: [
            { word: "sit", ipa: "/sɪt/", text: "Ngồi" },
            { word: "his", ipa: "/hɪz/", text: "Của anh ấy" },
            { word: "big", ipa: "/bɪɡ/", text: "Lớn" }
        ]
    },
    {
        symbol: "/e/",
        name: "Nguyên âm ngắn (Short Vowel)",
        type: "short-vowel",
        voicing: "voiced",
        description: [
            "Mở miệng tự nhiên sang hai bên rộng hơn âm /ɪ/.",
            "Độ rộng môi trung bình, lưỡi đặt ở vị trí trung tâm thấp.",
            "Phát âm ngắn, dứt khoát hơi bật ra ngoài."
        ],
        examples: [
            { word: "pen", ipa: "/pen/", text: "Bút viết" },
            { word: "bed", ipa: "/bed/", text: "Cái giường" },
            { word: "red", ipa: "/red/", text: "Màu đỏ" }
        ]
    },
    {
        symbol: "/æ/",
        name: "Nguyên âm ngắn (Short Vowel)",
        type: "short-vowel",
        voicing: "voiced",
        description: [
            "Miệng mở rộng tối đa theo cả chiều ngang và chiều dọc (như đang cười to).",
            "Hạ thấp hàm dưới xuống, lưỡi đặt ở vị trí cực kỳ thấp chạm răng cửa dưới.",
            "Âm phát ra nửa A nửa E kết hợp hơi dài một chút."
        ],
        examples: [
            { word: "cat", ipa: "/kæt/", text: "Con mèo" },
            { word: "bad", ipa: "/bæd/", text: "Tồi tệ" },
            { word: "map", ipa: "/mæp/", text: "Bản đồ" }
        ]
    },
    {
        symbol: "/ʌ/",
        name: "Nguyên âm ngắn (Short Vowel)",
        type: "short-vowel",
        voicing: "voiced",
        description: [
            "Miệng mở tự nhiên theo chiều dọc nhưng ít hơn âm /æ/.",
            "Lưỡi hơi rụt về phía sau một chút.",
            "Bật hơi nhanh và dứt khoát (âm á trong tiếng Việt)."
        ],
        examples: [
            { word: "cup", ipa: "/kʌp/", text: "Cái cốc" },
            { word: "love", ipa: "/lʌv/", text: "Yêu thương" },
            { word: "run", ipa: "/rʌn/", text: "Chạy bộ" }
        ]
    },
    {
        symbol: "/ɑ:/",
        name: "Nguyên âm dài (Long Vowel)",
        type: "long-vowel",
        voicing: "voiced",
        description: [
            "Hạ cằm xuống sâu để mở miệng rộng theo chiều dọc.",
            "Lưỡi hạ rất thấp ở phía sau khoang miệng.",
            "Ngân dài hơi tựa như đang khám họng (âm a dài)."
        ],
        examples: [
            { word: "car", ipa: "/kɑːr/", text: "Xe hơi" },
            { word: "far", ipa: "/fɑːr/", text: "Xa xôi" },
            { word: "father", ipa: "/ˈfɑːðər/", text: "Bố" }
        ]
    },
    {
        symbol: "/ɒ/",
        name: "Nguyên âm ngắn (Short Vowel)",
        type: "short-vowel",
        voicing: "voiced",
        description: [
            "Môi hơi tròn nhẹ và nhô ra ngoài một chút.",
            "Lưỡi hạ thấp và kéo về phía sau.",
            "Phát âm o ngắn dứt khoát nhanh chóng."
        ],
        examples: [
            { word: "hot", ipa: "/hɒt/", text: "Nóng" },
            { word: "dog", ipa: "/dɒɡ/", text: "Con chó" },
            { word: "shop", ipa: "/ʃɒp/", text: "Cửa hàng" }
        ]
    },
    {
        symbol: "/ɔ:/",
        name: "Nguyên âm dài (Long Vowel)",
        type: "long-vowel",
        voicing: "voiced",
        description: [
            "Tròn môi hết cỡ và đẩy về phía trước như đang huýt sáo.",
            "Lưỡi nâng cao ở phía sau khoang miệng.",
            "Bật hơi và ngân dài âm o kéo dài."
        ],
        examples: [
            { word: "door", ipa: "/dɔːr/", text: "Cánh cửa" },
            { word: "fall", ipa: "/fɔːl/", text: "Rơi rụng" },
            { word: "law", ipa: "/lɔː/", text: "Luật pháp" }
        ]
    },
    {
        symbol: "/ʊ/",
        name: "Nguyên âm ngắn (Short Vowel)",
        type: "short-vowel",
        voicing: "voiced",
        description: [
            "Môi mở hé nhẹ và hơi tròn nhẹ nhô về phía trước.",
            "Lưỡi hơi nâng lên và hướng về phía sau khoang miệng.",
            "Phát âm u ngắn dứt khoát (giống hơi lai ô)."
        ],
        examples: [
            { word: "book", ipa: "/bʊk/", text: "Quyển sách" },
            { word: "put", ipa: "/pʊt/", text: "Đặt để" },
            { word: "good", ipa: "/ɡʊd/", text: "Tốt" }
        ]
    },
    {
        symbol: "/u:/",
        name: "Nguyên âm dài (Long Vowel)",
        type: "long-vowel",
        voicing: "voiced",
        description: [
            "Môi chúm tròn hẳn lại và nhô ra phía trước rất nhiều.",
            "Lưỡi nâng rất cao chạm gần ngạc mềm ở phía sau.",
            "Phát âm u ngân dài hơi ấm và sâu."
        ],
        examples: [
            { word: "too", ipa: "/tuː/", text: "Quá / Cũng" },
            { word: "blue", ipa: "/bluː/", text: "Màu xanh" },
            { word: "shoe", ipa: "/ʃuː/", text: "Chiếc giày" }
        ]
    },
    {
        symbol: "/ə/",
        name: "Nguyên âm ngắn (Short Vowel)",
        type: "short-vowel",
        voicing: "voiced",
        description: [
            "Miệng mở tự nhiên ở trạng thái hoàn toàn thư giãn.",
            "Lưỡi thả lỏng đặt ở vị trí trung tâm khoang miệng.",
            "Phát âm nhẹ nhàng ngắn dứt khoát (âm ơ ngắn)."
        ],
        examples: [
            { word: "about", ipa: "/əˈbaʊt/", text: "Về cái gì" },
            { word: "teacher", ipa: "/ˈtiːtʃər/", text: "Giáo viên" },
            { word: "ago", ipa: "/əˈɡoʊ/", text: "Trước đây" }
        ]
    },
    {
        symbol: "/ɜ:/",
        name: "Nguyên âm dài (Long Vowel)",
        type: "long-vowel",
        voicing: "voiced",
        description: [
            "Môi mở hờ hé tự nhiên, răng hơi hé mở.",
            "Lưỡi đặt phẳng ở vị trí trung tâm nhưng hơi cong lưỡi lên một chút.",
            "Ngân dài hơi âm ơ kết hợp uốn lưỡi nhẹ."
        ],
        examples: [
            { word: "bird", ipa: "/bɜːrd/", text: "Con chim" },
            { word: "work", ipa: "/wɜːrk/", text: "Làm việc" },
            { word: "girl", ipa: "/ɡɜːrl/", text: "Cô gái" }
        ]
    },

    // 8 Diphthongs (Nguyên âm đôi)
    {
        symbol: "/eɪ/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu mở miệng phát âm /e/ tự nhiên.",
            "Từ từ khép miệng lại và chuyển môi sang phát âm /ɪ/.",
            "Môi di chuyển dẹt dần sang hai bên."
        ],
        examples: [
            { word: "day", ipa: "/deɪ/", text: "Ngày" },
            { word: "say", ipa: "/seɪ/", text: "Nói" },
            { word: "make", ipa: "/meɪk/", text: "Làm, tạo ra" }
        ]
    },
    {
        symbol: "/aɪ/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu mở miệng rộng tối đa phát âm cằm dưới hạ sâu (/ɑ:/).",
            "Môi từ từ khép lại và dẹt dần sang phát âm âm /ɪ/ ngắn.",
            "Tạo thành một đường trượt âm thanh mượt mà."
        ],
        examples: [
            { word: "my", ipa: "/maɪ/", text: "Của tôi" },
            { word: "time", ipa: "/taɪm/", text: "Thời gian" },
            { word: "like", ipa: "/laɪk/", text: "Thích" }
        ]
    },
    {
        symbol: "/ɔɪ/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu tròn môi chu ra phía trước phát âm âm /ɔ:/.",
            "Từ từ thu môi dẹt dần sang hai bên phát âm âm /ɪ/.",
            "Quá trình chuyển âm mượt mà liên tục."
        ],
        examples: [
            { word: "boy", ipa: "/bɔɪ/", text: "Cậu bé" },
            { word: "oil", ipa: "/ɔɪl/", text: "Dầu ăn" },
            { word: "coin", ipa: "/kɔɪn/", text: "Đồng xu" }
        ]
    },
    {
        symbol: "/aʊ/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu mở miệng rộng phát âm âm /ɑ:/.",
            "Từ từ thu tròn môi lại nhô về trước phát âm âm /ʊ/.",
            "Tạo luồng hơi trượt sâu ấm dần."
        ],
        examples: [
            { word: "now", ipa: "/naʊ/", text: "Bây giờ" },
            { word: "out", ipa: "/aʊt/", text: "Bên ngoài" },
            { word: "house", ipa: "/haʊs/", text: "Ngôi nhà" }
        ]
    },
    {
        symbol: "/əʊ/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu thư giãn mở nhẹ miệng phát âm âm /ə/.",
            "Từ từ tròn môi thu nhỏ miệng nhô ra phát âm âm /ʊ/.",
            "Phát âm tròn trịa hơi trầm nhẹ."
        ],
        examples: [
            { word: "no", ipa: "/noʊ/", text: "Không" },
            { word: "go", ipa: "/ɡoʊ/", text: "Đi" },
            { word: "home", ipa: "/hoʊm/", text: "Nhà" }
        ]
    },
    {
        symbol: "/ɪə/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu dẹt môi nhẹ phát âm âm /ɪ/ dứt khoát.",
            "Từ từ mở cằm thả lỏng cơ miệng phát âm âm /ə/.",
            "Hơi trượt từ trong ra ngoài thư giãn."
        ],
        examples: [
            { word: "near", ipa: "/nɪər/", text: "Gần" },
            { word: "hear", ipa: "/hɪər/", text: "Nghe thấy" },
            { word: "beer", ipa: "/bɪər/", text: "Bia" }
        ]
    },
    {
        symbol: "/eə/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu mở miệng rộng trung bình phát âm âm /e/.",
            "Từ từ hạ nhẹ lưỡi và miệng chuyển sang phát âm âm /ə/.",
            "Cảm giác cơ hàm thả lỏng dần khi kết thúc."
        ],
        examples: [
            { word: "hair", ipa: "/heər/", text: "Tóc" },
            { word: "there", ipa: "/ðeər/", text: "Ở đó" },
            { word: "care", ipa: "/keər/", text: "Chăm sóc" }
        ]
    },
    {
        symbol: "/ʊə/",
        name: "Nguyên âm đôi (Diphthong)",
        type: "diphthong",
        voicing: "voiced",
        description: [
            "Bắt đầu nhô nhẹ môi tròn phát âm âm /ʊ/.",
            "Mở dần cơ miệng thả lỏng hoàn toàn sang âm /ə/.",
            "Hơi bật nhẹ dần dứt khoát."
        ],
        examples: [
            { word: "poor", ipa: "/pʊər/", text: "Nghèo khổ" },
            { word: "tour", ipa: "/tʊər/", text: "Chuyến du lịch" },
            { word: "sure", ipa: "/ʃʊər/", text: "Chắc chắn" }
        ]
    },

    // 24 Consonants (Phụ âm)
    {
        symbol: "/p/",
        name: "Phụ âm vô thanh (Plosive)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Mím chặt hai môi lại để chặn luồng khí trong miệng.",
            "Đẩy luồng hơi từ phổi dồn lên sau môi.",
            "Mở nhanh hai môi để hơi bật mạnh ra ngoài (không rung cổ họng)."
        ],
        examples: [
            { word: "pen", ipa: "/pen/", text: "Cây bút" },
            { word: "map", ipa: "/mæp/", text: "Bản đồ" }
        ]
    },
    {
        symbol: "/b/",
        name: "Phụ âm hữu thanh (Plosive)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Đặt khẩu hình môi khép kín giống âm /p/.",
            "Tích tụ luồng hơi hơi phồng má nhẹ.",
            "Bật nhanh môi ra đồng thời rung thanh quản mạnh để tạo âm thanh."
        ],
        examples: [
            { word: "bed", ipa: "/bed/", text: "Cái giường" },
            { word: "big", ipa: "/bɪɡ/", text: "Lớn" }
        ]
    },
    {
        symbol: "/t/",
        name: "Phụ âm vô thanh (Plosive)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Đặt đầu lưỡi chạm vào phần nướu phía sau răng cửa trên.",
            "Chặn luồng khí lại rồi bật mạnh đầu lưỡi ra.",
            "Luồng hơi bật ra sắc nét tự nhiên (không rung cổ họng)."
        ],
        examples: [
            { word: "tea", ipa: "/tiː/", text: "Trà" },
            { word: "sit", ipa: "/sɪt/", text: "Ngồi" }
        ]
    },
    {
        symbol: "/d/",
        name: "Phụ âm hữu thanh (Plosive)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Đặt vị trí đầu lưỡi tương tự âm /t/.",
            "Bật đầu lưỡi hạ nhanh xuống dưới.",
            "Rung cổ họng mạnh để phát ra âm trầm vang nhẹ."
        ],
        examples: [
            { word: "dog", ipa: "/dɒɡ/", text: "Con chó" },
            { word: "bad", ipa: "/bæd/", text: "Tồi tệ" }
        ]
    },
    {
        symbol: "/k/",
        name: "Phụ âm vô thanh (Plosive)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Nâng phần cuống lưỡi lên chạm vào ngạc mềm phía sau miệng để chặn khí.",
            "Hạ nhanh cuống lưỡi để hơi bật từ cổ họng thoát ra ngoài.",
            "Hơi phát ra như tiếng khạc nhẹ (không rung cổ họng)."
        ],
        examples: [
            { word: "cat", ipa: "/kæt/", text: "Con mèo" },
            { word: "work", ipa: "/wɜːrk/", text: "Làm việc" }
        ]
    },
    {
        symbol: "/g/",
        name: "Phụ âm hữu thanh (Plosive)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Khẩu hình đặt giống hệt cuống lưỡi chạm ngạc mềm của âm /k/.",
            "Hạ nhanh cuống lưỡi bật âm gừ nhẹ.",
            "Rung cổ họng mạnh khi bật âm."
        ],
        examples: [
            { word: "go", ipa: "/ɡoʊ/", text: "Đi" },
            { word: "bag", ipa: "/bæɡ/", text: "Cái túi" }
        ]
    },
    {
        symbol: "/f/",
        name: "Phụ âm vô thanh (Fricative)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Đặt hàm răng cửa trên chạm nhẹ vào phần trong của môi dưới.",
            "Đẩy hơi từ phổi thoát ra qua khe hở giữa răng và môi.",
            "Tạo ra âm gió xì nhẹ kéo dài (không rung cổ họng)."
        ],
        examples: [
            { word: "fan", ipa: "/fæn/", text: "Cái quạt" },
            { word: "far", ipa: "/fɑːr/", text: "Xa" }
        ]
    },
    {
        symbol: "/v/",
        name: "Phụ âm hữu thanh (Fricative)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Đặt khẩu hình răng trên cắn nhẹ môi dưới như âm /f/.",
            "Đẩy hơi thoát ra qua khe răng môi đồng thời rung cổ họng.",
            "Cảm nhận môi dưới hơi tê nhẹ do rung động âm thanh."
        ],
        examples: [
            { word: "van", ipa: "/væn/", text: "Xe tải nhỏ" },
            { word: "love", ipa: "/lʌv/", text: "Yêu" }
        ]
    },
    {
        symbol: "/θ/",
        name: "Phụ âm vô thanh (Fricative)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Đặt nhẹ đầu lưỡi ở giữa răng cửa trên và răng cửa dưới.",
            "Đẩy hơi thoát ra khe giữa mặt lưỡi và răng trên.",
            "Bật hơi xì nhẹ tự nhiên (âm th thổi gió, không rung cổ)."
        ],
        examples: [
            { word: "thin", ipa: "/θɪn/", text: "Mỏng manh" },
            { word: "thank", ipa: "/θæŋk/", text: "Cảm ơn" }
        ]
    },
    {
        symbol: "/ð/",
        name: "Phụ âm hữu thanh (Fricative)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Đặt đầu lưỡi kẹp giữa hai răng như âm /θ/.",
            "Đẩy hơi ra đồng thời rung thanh quản mạnh.",
            "Cảm giác lưỡi hơi tê và ngứa nhẹ do rung động."
        ],
        examples: [
            { word: "this", ipa: "/ðɪs/", text: "Cái này" },
            { word: "father", ipa: "/ˈfɑːðər/", text: "Cha" }
        ]
    },
    {
        symbol: "/s/",
        name: "Phụ âm vô thanh (Fricative)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Hai hàm răng khép gần sát nhau nhưng không chạm.",
            "Mặt lưỡi nâng nhẹ chạm vào vòm miệng, hơi cong đầu lưỡi lên.",
            "Đẩy hơi thoát qua khe răng tạo âm xì dài giống tiếng rắn kêu (không rung cổ)."
        ],
        examples: [
            { word: "see", ipa: "/siː/", text: "Nhìn" },
            { word: "sit", ipa: "/sɪt/", text: "Ngồi" }
        ]
    },
    {
        symbol: "/z/",
        name: "Phụ âm hữu thanh (Fricative)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Khép hờ hai hàm răng giống vị trí phát âm /s/.",
            "Đẩy hơi ra ngoài qua khe răng đồng thời rung mạnh cổ họng.",
            "Tạo âm xì rè như tiếng ong kêu."
        ],
        examples: [
            { word: "zoo", ipa: "/zuː/", text: "Sở thú" },
            { word: "his", ipa: "/hɪz/", text: "Của anh" }
        ]
    },
    {
        symbol: "/ʃ/",
        name: "Phụ âm vô thanh (Fricative)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Môi tru tròn nhô ra phía trước rất nhiều.",
            "Nâng lưỡi lên cao sát vòm miệng tạo khe hẹp lớn.",
            "Đẩy luồng hơi thoát ra mạnh mẽ như khi yêu cầu giữ trật tự 'suỵt'."
        ],
        examples: [
            { word: "ship", ipa: "/ʃɪp/", text: "Tàu thủy" },
            { word: "shop", ipa: "/ʃɒp/", text: "Cửa hàng" }
        ]
    },
    {
        symbol: "/ʒ/",
        name: "Phụ âm hữu thanh (Fricative)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Môi tru tròn tương tự âm /ʃ/.",
            "Đẩy hơi qua vòm miệng đồng thời rung mạnh thanh quản.",
            "Tạo âm rung dày đặc trưng."
        ],
        examples: [
            { word: "measure", ipa: "/ˈmeʒər/", text: "Đo lường" },
            { word: "vision", ipa: "/ˈvɪʒn/", text: "Tầm nhìn" }
        ]
    },
    {
        symbol: "/tʃ/",
        name: "Phụ âm vô thanh (Affricate)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Chu tròn môi nhô trước kết hợp lưỡi chặn ngạc trên (giống /t/ + /ʃ/).",
            "Bật hơi nén thoát ra khe lưỡi nhanh chóng.",
            "Không rung cổ họng (âm chờ bật hơi gió)."
        ],
        examples: [
            { word: "chin", ipa: "/tʃɪn/", text: "Cái cằm" },
            { word: "watch", ipa: "/wɒtʃ/", text: "Xem" }
        ]
    },
    {
        symbol: "/dʒ/",
        name: "Phụ âm hữu thanh (Affricate)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Đặt khẩu hình chu môi tương tự âm /tʃ/.",
            "Nén hơi và bật cuống họng phát âm rung lớn.",
            "Rung mạnh thanh quản khi đẩy âm ra."
        ],
        examples: [
            { word: "job", ipa: "/dʒɒb/", text: "Công việc" },
            { word: "age", ipa: "/eɪdʒ/", text: "Tuổi tác" }
        ]
    },
    {
        symbol: "/m/",
        name: "Phụ âm mũi (Nasal)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Mím chặt hai môi hoàn toàn chặn khí miệng.",
            "Hạ ngạc mềm xuống cho phép luồng khí thoát ra đường mũi.",
            "Rung cổ họng tạo âm mồm khép 'ừm' trong cổ."
        ],
        examples: [
            { word: "map", ipa: "/mæp/", text: "Bản đồ" },
            { word: "meet", ipa: "/miːt/", text: "Gặp gỡ" }
        ]
    },
    {
        symbol: "/n/",
        name: "Phụ âm mũi (Nasal)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Đặt đầu lưỡi chạm chặt lên nướu răng cửa trên chặn hoàn toàn hơi miệng.",
            "Đẩy khí thoát ra đường mũi.",
            "Rung cổ họng phát ra âm vọng lên mũi."
        ],
        examples: [
            { word: "no", ipa: "/noʊ/", text: "Không" },
            { word: "pen", ipa: "/pen/", text: "Bút" }
        ]
    },
    {
        symbol: "/ŋ/",
        name: "Phụ âm mũi (Nasal)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Nâng cuống lưỡi chạm ngạc mềm phía sau chặn hơi.",
            "Đẩy hơi thoát ra qua đường mũi.",
            "Rung cổ họng ngân nhẹ (âm ng như đuôi từ tiếng Việt)."
        ],
        examples: [
            { word: "sing", ipa: "/sɪŋ/", text: "Hát" },
            { word: "thank", ipa: "/θæŋk/", text: "Cảm ơn" }
        ]
    },
    {
        symbol: "/h/",
        name: "Phụ âm vô thanh (Approximant)",
        type: "voiceless-consonant",
        voicing: "voiceless",
        description: [
            "Miệng mở tự nhiên thư giãn.",
            "Đẩy luồng hơi nhẹ nhàng từ phổi thoát ra ngoài.",
            "Giống tiếng thở phào nhẹ nhõm (không rung cổ)."
        ],
        examples: [
            { word: "hot", ipa: "/hɒt/", text: "Nóng nực" },
            { word: "hear", ipa: "/hɪər/", text: "Nghe" }
        ]
    },
    {
        symbol: "/l/",
        name: "Phụ âm hữu thanh (Approximant)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Đặt đầu lưỡi chạm vào nướu răng cửa trên.",
            "Luồng khí thoát ra ngoài lách qua hai bên cạnh của lưỡi.",
            "Rung cổ họng tạo âm ngân đặc trưng."
        ],
        examples: [
            { word: "law", ipa: "/lɔː/", text: "Luật pháp" },
            { word: "blue", ipa: "/bluː/", text: "Màu xanh" }
        ]
    },
    {
        symbol: "/r/",
        name: "Phụ âm hữu thanh (Approximant)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Môi hơi tròn nhô trước nhẹ.",
            "Cong đầu lưỡi ngược về phía sau vòm miệng nhưng không chạm vòm họng.",
            "Đẩy hơi lướt qua lưỡi và rung cổ họng phát âm."
        ],
        examples: [
            { word: "run", ipa: "/rʌn/", text: "Chạy" },
            { word: "red", ipa: "/red/", text: "Màu đỏ" }
        ]
    },
    {
        symbol: "/w/",
        name: "Phụ âm hữu thanh (Approximant)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Môi thu tròn hết cỡ nhô hẳn ra trước giống âm /u:/.",
            "Từ từ mở rộng môi mở miệng và thả lỏng lưỡi.",
            "Phát âm u-ờ lướt nhanh đồng thời rung cổ họng."
        ],
        examples: [
            { word: "we", ipa: "/wiː/", text: "Chúng tôi" },
            { word: "work", ipa: "/wɜːrk/", text: "Làm việc" }
        ]
    },
    {
        symbol: "/j/",
        name: "Phụ âm hữu thanh (Approximant)",
        type: "voiced-consonant",
        voicing: "voiced",
        description: [
            "Khẩu hình đặt giống như chuẩn bị phát âm /i:/ dài.",
            "Hạ hàm dưới xuống mở rộng miệng đồng thời nâng nhanh lưỡi lên.",
            "Đẩy hơi trượt và rung cổ tạo âm (tương đương âm d/gi tiếng Việt)."
        ],
        examples: [
            { word: "yes", ipa: "/jes/", text: "Vâng, đúng vậy" },
            { word: "you", ipa: "/juː/", text: "Bạn" }
        ]
    }
];

// Sound Sorting Game Words Database (Ending -s/es)
const soundGameWords = [
    { word: "works", correct: "s", explanation: "Từ gốc 'work' kết thúc bằng âm vô thanh /k/, nên đuôi -s được phát âm là /s/." },
    { word: "plays", correct: "z", explanation: "Từ gốc 'play' kết thúc bằng nguyên âm hữu thanh /eɪ/, nên đuôi -s được phát âm là /z/." },
    { word: "watches", correct: "iz", explanation: "Từ gốc 'watch' kết thúc bằng âm xuýt /tʃ/, nên đuôi -es được phát âm là /ɪz/." },
    { word: "stops", correct: "s", explanation: "Từ gốc 'stop' kết thúc bằng âm vô thanh /p/, nên đuôi -s được phát âm là /s/." },
    { word: "runs", correct: "z", explanation: "Từ gốc 'run' kết thúc bằng phụ âm hữu thanh /n/, nên đuôi -s được phát âm là /z/." },
    { word: "washes", correct: "iz", explanation: "Từ gốc 'wash' kết thúc bằng âm xuýt /ʃ/, nên đuôi -es được phát âm là /ɪz/." },
    { word: "looks", correct: "s", explanation: "Từ gốc 'look' kết thúc bằng âm vô thanh /k/, nên đuôi -s được phát âm là /s/." },
    { word: "calls", correct: "z", explanation: "Từ gốc 'call' kết thúc bằng âm hữu thanh /l/, nên đuôi -s được phát âm là /z/." },
    { word: "teaches", correct: "iz", explanation: "Từ gốc 'teach' kết thúc bằng âm xuýt /tʃ/, nên đuôi -es được phát âm là /ɪz/." },
    { word: "helps", correct: "s", explanation: "Từ gốc 'help' kết thúc bằng âm vô thanh /p/, nên đuôi -s được phát âm là /s/." },
    { word: "loves", correct: "z", explanation: "Từ gốc 'love' kết thúc bằng phụ âm hữu thanh /v/, nên đuôi -s được phát âm là /z/." },
    { word: "fixes", correct: "iz", explanation: "Từ gốc 'fix' kết thúc bằng âm xuýt /s/ (của âm /ks/), nên đuôi -es được phát âm là /ɪz/." },
    { word: "laughs", correct: "s", explanation: "Từ gốc 'laugh' kết thúc bằng âm vô thanh /f/, nên đuôi -s được phát âm là /s/." },
    { word: "lives", correct: "z", explanation: "Từ gốc 'live' kết thúc bằng âm hữu thanh /v/, nên đuôi -s được phát âm là /z/." },
    { word: "kisses", correct: "iz", explanation: "Từ gốc 'kiss' kết thúc bằng âm xuýt /s/, nên đuôi -es được phát âm là /ɪz/." },
    { word: "reads", correct: "z", explanation: "Từ gốc 'read' kết thúc bằng âm hữu thanh /d/, nên đuôi -s được phát âm là /z/." }
];

// Interactive Quiz Questions Database (Ngữ pháp & Phát âm)
// Interactive Quiz Questions Database (Restructured to 10 Lessons x 10 Questions)
const questionsDatabase = {
    lesson1: [
        {
            type: 'mcq',
            question: 'Chọn từ có phát âm nguyên âm <b>KHÁC</b> các từ còn lại:',
            options: ['sheep (/i:/)', 'meat (/i:/)', 'ship (/ɪ/)', 'see (/i:/)'],
            correct: 'ship (/ɪ/)',
            explanation: 'Từ "ship" chứa nguyên âm ngắn /ɪ/, trong khi 3 từ còn lại chứa nguyên âm dài /i:/.'
        },
        {
            type: 'fitb',
            question: 'Nguyên âm nào là nguyên âm dài trong hai âm <b>/i:/</b> và <b>/ɪ/</b>?',
            correct: ['/i:/', 'i:'],
            explanation: 'Âm /i:/ là nguyên âm dài (được ký hiệu bằng dấu hai chấm), phát âm mở rộng môi giống đang cười.'
        },
        {
            type: 'mcq',
            question: 'Từ "father" (/ˈfɑːðər/) chứa nguyên âm đơn nào sau đây?',
            options: ['/ɑ:/', '/æ/', '/ʌ/', '/ɒ/'],
            correct: '/ɑ:/',
            explanation: 'Từ "father" phát âm chứa nguyên âm dài mở rộng miệng /ɑ:/.'
        },
        {
            type: 'mcq',
            question: 'Từ "cat" (/kæt/) chứa nguyên âm đơn ngắn nào sau đây?',
            options: ['/æ/', '/e/', '/ʌ/', '/ɑ:/'],
            correct: '/æ/',
            explanation: 'Từ "cat" chứa âm e bẹt /æ/, miệng mở rộng hết cỡ ra 4 hướng như đang cười to.'
        },
        {
            type: 'mcq',
            question: 'Từ nào sau đây chứa nguyên âm ngắn <b>/ɒ/</b>?',
            options: ['dog', 'door', 'dark', 'day'],
            correct: 'dog',
            explanation: 'Từ "dog" phát âm là /dɒɡ/ trong giọng Anh-Anh, chứa nguyên âm ngắn /ɒ/.'
        },
        {
            type: 'mcq',
            question: 'Âm <b>/ə/</b> được gọi là gì trong tiếng Anh?',
            options: ['Âm Schwa', 'Âm dài', 'Âm vô thanh', 'Phụ âm'],
            correct: 'Âm Schwa',
            explanation: 'Âm /ə/ là âm yếu và phổ biến nhất trong tiếng Anh, được gọi là âm Schwa.'
        },
        {
            type: 'mcq',
            question: 'Nguyên âm đơn nào xuất hiện trong từ "bird" (/bɜːd/)?',
            options: ['/ɜ:/', '/ə/', '/ɔ:/', '/ɑ:/'],
            correct: '/ɜ:/',
            explanation: 'Từ "bird" chứa nguyên âm dài /ɜ:/, là một âm lười hướng lưỡi về giữa khoang miệng.'
        },
        {
            type: 'fitb',
            question: 'Nguyên âm đơn <b>/u:/</b> là nguyên âm ngắn hay nguyên âm dài?',
            correct: ['dài', 'dai', 'long vowel'],
            explanation: 'Âm /u:/ là nguyên âm dài (có dấu hai chấm), chu môi tròn phát âm giống tiếng hú.'
        },
        {
            type: 'mcq',
            question: 'Từ "book" (/bʊk/) chứa nguyên âm đơn ngắn nào?',
            options: ['/ʊ/', '/u:/', '/ʌ/', '/ɒ/'],
            correct: '/ʊ/',
            explanation: 'Từ "book" phát âm chứa âm u ngắn /ʊ/, hơi chu môi nhẹ và bật âm dứt khoát.'
        },
        {
            type: 'mcq',
            question: 'Chọn từ có phát âm chứa nguyên âm ngắn <b>/ʌ/</b>:',
            options: ['cup', 'car', 'cop', 'keep'],
            correct: 'cup',
            explanation: 'Từ "cup" phát âm là /kʌp/, chứa nguyên âm ngắn nửa mở /ʌ/.'
        }
    ],
    lesson2: [
        {
            type: 'mcq',
            question: 'Nguyên âm đôi (Diphthongs) là sự kết hợp của mấy nguyên âm đơn?',
            options: ['2 nguyên âm đơn', '3 nguyên âm đơn', '1 nguyên âm đơn', '4 nguyên âm đơn'],
            correct: '2 nguyên âm đơn',
            explanation: 'Nguyên âm đôi là sự kết hợp của 2 nguyên âm đơn bằng cách trượt từ âm này sang âm kia trong một hơi.'
        },
        {
            type: 'fitb',
            question: 'Từ "boy" (/bɔɪ/) chứa nguyên âm đôi nào?',
            correct: ['/bɔɪ/', 'bɔɪ', '/ɔɪ/', 'ɔɪ'],
            explanation: 'Từ "boy" chứa nguyên âm đôi /ɔɪ/ (kết hợp từ /ɔ/ trượt sang /ɪ/).'
        },
        {
            type: 'mcq',
            question: 'Từ "late" (/leɪt/) chứa nguyên âm đôi nào sau đây?',
            options: ['/eɪ/', '/aɪ/', '/aʊ/', '/eə/'],
            correct: '/eɪ/',
            explanation: 'Từ "late" chứa nguyên âm đôi /eɪ/ (kết hợp từ âm /e/ trượt sang /ɪ/).'
        },
        {
            type: 'fitb',
            question: 'Âm <b>/p/</b> là âm vô thanh hay hữu thanh?',
            correct: ['vô thanh', 'vo thanh'],
            explanation: 'Âm /p/ là âm vô thanh (chỉ bật hơi gió từ môi, cổ họng không rung).'
        },
        {
            type: 'fitb',
            question: 'Âm <b>/b/</b> là âm vô thanh hay hữu thanh?',
            correct: ['hữu thanh', 'huu thanh'],
            explanation: 'Âm /b/ là âm hữu thanh (khi phát âm rung mạnh dây thanh quản).'
        },
        {
            type: 'mcq',
            question: 'Chọn từ có phụ âm đầu là âm <b>vô thanh</b>:',
            options: ['pen', 'boy', 'dog', 'go'],
            correct: 'pen',
            explanation: 'Từ "pen" bắt đầu bằng âm vô thanh /p/. Các từ còn lại bắt đầu bằng âm hữu thanh /b/, /d/, /ɡ/.'
        },
        {
            type: 'mcq',
            question: 'Từ nào sau đây chứa phụ âm hữu thanh <b>/z/</b>?',
            options: ['busy', 'easy', 'Cả hai đều đúng', 'Không từ nào đúng'],
            correct: 'Cả hai đều đúng',
            explanation: 'Cả "busy" (/ˈbɪzi/) và "easy" (/ˈiːzi/) đều có chữ "s" được phát âm là phụ âm hữu thanh /z/.'
        },
        {
            type: 'mcq',
            question: 'Phát âm của âm "th" trong từ "think" (/θɪŋk/) là âm gì?',
            options: ['/θ/ (âm vô thanh)', '/ð/ (âm hữu thanh)', '/t/', '/d/'],
            correct: '/θ/ (âm vô thanh)',
            explanation: 'Từ "think" chứa âm vô thanh /θ/ (đặt đầu lưỡi giữa răng cửa và thổi gió ra).'
        },
        {
            type: 'mcq',
            question: 'Phát âm của âm "th" trong từ "mother" (/ˈmʌðər/) là âm gì?',
            options: ['/ð/ (âm hữu thanh)', '/θ/ (âm vô thanh)', '/d/', '/z/'],
            correct: '/ð/ (âm hữu thanh)',
            explanation: 'Từ "mother" chứa âm hữu thanh /ð/ (cách đặt miệng giống /θ/ nhưng rung cổ họng).'
        },
        {
            type: 'mcq',
            question: 'Chọn cặp phụ âm tương ứng: Phụ âm vô thanh <b>/t/</b> tương ứng với phụ âm hữu thanh nào?',
            options: ['/d/', '/b/', '/g/', '/s/'],
            correct: '/d/',
            explanation: 'Cặp âm /t/ và /d/ có chung vị trí khẩu hình miệng (đầu lưỡi chạm nướu răng trên), chỉ khác /t/ là vô thanh và /d/ là hữu thanh.'
        }
    ],
    lesson3: [
        {
            type: 'mcq',
            question: 'She _______ (be) a beautiful and highly intelligent student.',
            options: ['am', 'is', 'are', 'be'],
            correct: 'is',
            explanation: 'Chủ ngữ "She" là ngôi thứ 3 số ít, động từ TO BE đi kèm ở hiện tại là "is".'
        },
        {
            type: 'mcq',
            question: 'They _______ (not be) ready for the final examination yet.',
            options: ['am not', "isn't", "aren't", 'don\'t be'],
            correct: "aren't",
            explanation: 'Chủ ngữ "They" số nhiều, thể phủ định của TO BE là "are not" (viết tắt là "aren\'t").'
        },
        {
            type: 'fitb',
            question: 'I _______ (be) highly interested in learning English vocabulary.',
            correct: ['am'],
            explanation: 'Chủ ngữ "I" đi kèm với động từ TO BE ở hiện tại đơn là "am".'
        },
        {
            type: 'fitb',
            question: '_______ you a member of this premium online class?',
            correct: ['Are', 'are'],
            explanation: 'Câu nghi vấn với chủ ngữ "you" đảo động từ TO BE "Are" lên đầu câu.'
        },
        {
            type: 'mcq',
            question: 'It _______ (be) a hot and sunny day today.',
            options: ['am', 'is', 'are', 'be'],
            correct: 'is',
            explanation: 'Chủ ngữ số ít "It" đi với động từ TO BE "is".'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Họ là những bác sĩ giỏi."',
            words: ['They', 'are', 'very', 'good', 'doctors'],
            correct: 'They are very good doctors',
            explanation: 'Cấu trúc câu: S + TO BE + Danh từ/Tính từ bổ nghĩa.'
        },
        {
            type: 'mcq',
            question: 'Chọn câu hỏi viết đúng cấu trúc ngữ pháp nhất:',
            options: ['Is he happy today?', 'Are he happy today?', 'He is happy today?', 'Am he happy today?'],
            correct: 'Is he happy today?',
            explanation: 'Câu hỏi nghi vấn TO BE ở quá khứ: Đảo TO BE (is) lên trước chủ ngữ số ít (he).'
        },
        {
            type: 'fitb',
            question: 'Who _______ (be) your favorite teacher at school?',
            correct: ['is'],
            explanation: 'Hỏi về đối tượng ngôi thứ 3 số ít "Who" đi kèm trợ động từ TO BE "is".'
        },
        {
            type: 'mcq',
            question: 'My parents _______ (be) extremely proud of my learning progress.',
            options: ['am', 'is', 'are', 'be'],
            correct: 'are',
            explanation: 'Chủ ngữ "My parents" (bố mẹ tôi) là số nhiều, đi kèm động từ TO BE "are".'
        },
        {
            type: 'mcq',
            question: 'Viết tắt của thể phủ định "She is not" là gì?',
            options: ["She isn't", "She's not", 'Cả hai đều đúng', 'She aren\'t'],
            correct: 'Cả hai đều đúng',
            explanation: '"She is not" có thể viết tắt theo hai cách: "She isn\'t" hoặc "She\'s not".'
        }
    ],
    lesson4: [
        {
            type: 'mcq',
            question: 'He _______ (play) soccer with his friends every weekend.',
            options: ['play', 'plays', 'playes', 'playing'],
            correct: 'plays',
            explanation: 'Chủ ngữ "He" ngôi thứ 3 số ít, động từ thường ở khẳng định hiện tại đơn thêm "-s" thành "plays".'
        },
        {
            type: 'mcq',
            question: 'We _______ (not drink) coffee late in the evening.',
            options: ['not drink', "don't drink", "doesn't drink", "don't drinks"],
            correct: "don't drink",
            explanation: 'Chủ ngữ "We" số nhiều, mượn trợ động từ phủ định "don\'t" + động từ nguyên mẫu "drink".'
        },
        {
            type: 'fitb',
            question: 'I _______ (study) English for 2 hours every single day.',
            correct: ['study'],
            explanation: 'Chủ ngữ "I" giữ nguyên động từ thường ở dạng nguyên mẫu "study".'
        },
        {
            type: 'fitb',
            question: 'Where _______ your sister live?',
            correct: ['does'],
            explanation: 'Câu hỏi nghi vấn Wh-, chủ ngữ "your sister" số ít nên mượn trợ động từ "does".'
        },
        {
            type: 'mcq',
            question: 'My father _______ (go) to work by car every morning.',
            options: ['go', 'gos', 'goes', 'going'],
            correct: 'goes',
            explanation: 'Chủ ngữ "My father" số ít, động từ "go" kết thúc bằng "o" nên thêm đuôi "-es" thành "goes".'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Tôi thường thức dậy lúc 6 giờ sáng."',
            words: ['I', 'usually', 'wake', 'up', 'at', '6', 'AM'],
            correct: 'I usually wake up at 6 AM',
            explanation: 'Trạng từ tần suất (usually) đứng trước động từ thường (wake up).'
        },
        {
            type: 'mcq',
            question: 'Chọn câu viết đúng ngữ pháp hiện tại đơn:',
            options: ["She don't like milk.", "She doesn't like milk.", "She doesn't likes milk.", "She not likes milk."],
            correct: "She doesn't like milk.",
            explanation: 'Phủ định số ít: mượn "doesn\'t", động từ chính phải trở về dạng nguyên mẫu không chia "like".'
        },
        {
            type: 'fitb',
            question: 'What _______ you usually do on Sunday afternoons?',
            correct: ['do'],
            explanation: 'Câu nghi vấn số nhiều với chủ ngữ "you" mượn trợ động từ "do".'
        },
        {
            type: 'mcq',
            question: 'The sun _______ (rise) in the East.',
            options: ['rise', 'rises', 'rising', 'rose'],
            correct: 'rises',
            explanation: 'Diễn tả chân lý/sự thật hiển nhiên. "The sun" số ít nên động từ thêm "s" thành "rises".'
        },
        {
            type: 'mcq',
            question: 'Cats _______ (love) catching mice.',
            options: ['love', 'loves', 'loving', 'loved'],
            correct: 'love',
            explanation: 'Chủ ngữ "Cats" số nhiều, động từ giữ nguyên mẫu ở dạng khẳng định là "love".'
        }
    ],
    lesson5: [
        {
            type: 'mcq',
            question: 'Từ "works" có đuôi <b>-s</b> được phát âm là âm gì?',
            options: ['/s/', '/z/', '/ɪz/', '/d/'],
            correct: '/s/',
            explanation: 'Động từ gốc "work" kết thúc bằng âm vô thanh /k/, nên đuôi -s phát âm vô thanh là /s/.'
        },
        {
            type: 'mcq',
            question: 'Từ "plays" có đuôi <b>-s</b> được phát âm là âm gì?',
            options: ['/z/', '/s/', '/ɪz/', '/t/'],
            correct: '/z/',
            explanation: 'Động từ gốc "play" kết thúc bằng nguyên âm hữu thanh /eɪ/, nên đuôi -s đọc hữu thanh là /z/.'
        },
        {
            type: 'mcq',
            question: 'Từ "watches" có đuôi <b>-es</b> được phát âm là âm gì?',
            options: ['/ɪz/', '/s/', '/z/', '/t/'],
            correct: '/ɪz/',
            explanation: 'Động từ gốc "watch" kết thúc bằng âm xuýt /tʃ/, nên đuôi -es phát âm là /ɪz/.'
        },
        {
            type: 'fitb',
            question: 'Đuôi -s/-es sau các âm xuýt (như /s/, /z/, /ʃ/, /tʃ/) được phát âm là âm gì?',
            correct: ['/ɪz/', 'iz', '/iz/'],
            explanation: 'Quy tắc âm xuýt (Sibilants) yêu cầu đuôi -es phát âm là /ɪz/ (thêm một âm tiết).'
        },
        {
            type: 'mcq',
            question: 'Đuôi -s sau các phụ âm vô thanh (như /p/, /t/, /k/, /f/) được phát âm là gì?',
            options: ['/s/', '/z/', '/ɪz/', '/d/'],
            correct: '/s/',
            explanation: 'Theo quy tắc đồng hóa phát âm: âm vô thanh đi kèm âm vô thanh /s/.'
        },
        {
            type: 'mcq',
            question: 'Chọn từ có phát âm đuôi <b>-s/-es</b> khác các từ còn lại:',
            options: ['cooks (/s/)', 'stops (/s/)', 'likes (/s/)', 'runs (/z/)'],
            correct: 'runs (/z/)',
            explanation: 'Từ "runs" đuôi -s phát âm là /z/ vì từ gốc kết thúc bằng phụ âm hữu thanh /n/. Các từ còn lại đọc là /s/.'
        },
        {
            type: 'mcq',
            question: 'Chọn từ có phát âm đuôi <b>-es</b> được phát âm là <b>/ɪz/</b>:',
            options: ['boxes', 'goes', 'does', 'lives'],
            correct: 'boxes',
            explanation: 'Từ gốc "box" kết thúc bằng phụ âm xuýt /s/ (của âm /ks/), nên đuôi -es được phát âm là /ɪz/.'
        },
        {
            type: 'fitb',
            question: 'Từ "laughs" (/lɑːfs/) có đuôi <b>-s</b> phát âm là /s/ hay /z/?',
            correct: ['/s/', 's'],
            explanation: 'Mặc dù viết là "gh" nhưng phát âm là âm vô thanh /f/, vì vậy đuôi -s phát âm vô thanh là /s/.'
        },
        {
            type: 'mcq',
            question: 'Từ "breathes" (/briːðz/) có đuôi <b>-s</b> phát âm là gì?',
            options: ['/z/', '/s/', '/ɪz/', '/t/'],
            correct: '/z/',
            explanation: 'Từ gốc "breathe" kết thúc bằng âm hữu thanh /ð/, do đó đuôi -s đọc hữu thanh là /z/.'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Mẹ tôi thường giặt quần áo."',
            words: ['My', 'mother', 'usually', 'washes', 'the', 'clothes'],
            correct: 'My mother usually washes the clothes',
            explanation: 'Động từ "wash" thêm đuôi -es phát âm là /ɪz/.'
        }
    ],
    lesson6: [
        {
            type: 'mcq',
            question: 'I _______ (be) at home all day yesterday afternoon.',
            options: ['was', 'were', 'am', 'been'],
            correct: 'was',
            explanation: 'Chủ ngữ "I" đi với động từ TO BE ở quá khứ đơn là "was".'
        },
        {
            type: 'mcq',
            question: 'They _______ (not be) at the music party last night.',
            options: ['was not', "weren't", "isn't", 'don\'t be'],
            correct: "weren't",
            explanation: 'Chủ ngữ "They" đi với phủ định TO BE quá khứ là "were not" (viết tắt là "weren\'t").'
        },
        {
            type: 'fitb',
            question: '_______ you tired after a long day at work yesterday?',
            correct: ['Were', 'were'],
            explanation: 'Câu nghi vấn quá khứ với chủ ngữ "you" đảo động từ TO BE "Were" lên đầu câu.'
        },
        {
            type: 'fitb',
            question: 'Where _______ she last Sunday afternoon?',
            correct: ['was'],
            explanation: 'Câu nghi vấn Wh- quá khứ với chủ ngữ số ít "she" đi kèm TO BE "was".'
        },
        {
            type: 'mcq',
            question: 'We _______ (be) extremely happy to see you last week.',
            options: ['was', 'were', 'are', 'been'],
            correct: 'were',
            explanation: 'Chủ ngữ số nhiều "We" đi kèm động từ TO BE quá khứ "were".'
        },
        {
            type: 'mcq',
            question: 'Chọn câu nghi vấn viết đúng ngữ pháp quá khứ nhất:',
            options: ['Was he sick yesterday?', 'Were he sick yesterday?', 'Did he sick yesterday?', 'Did he was sick yesterday?'],
            correct: 'Was he sick yesterday?',
            explanation: 'Câu hỏi nghi vấn TO BE ở quá khứ: Đảo TO BE (Was) lên trước chủ ngữ số ít (he), không mượn trợ động từ "did".'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Thời tiết hôm qua rất đẹp."',
            words: ['The', 'weather', 'was', 'beautiful', 'yesterday'],
            correct: 'The weather was beautiful yesterday',
            explanation: 'Cấu trúc: S (The weather) + was + Tính từ (beautiful) + trạng từ chỉ thời gian quá khứ (yesterday).'
        },
        {
            type: 'fitb',
            question: 'Why _______ they absent from class yesterday morning?',
            correct: ['were'],
            explanation: 'Chủ ngữ "they" số nhiều đi kèm động từ TO BE ở quá khứ là "were".'
        },
        {
            type: 'mcq',
            question: 'The text book _______ (be) on the desk an hour ago.',
            options: ['was', 'were', 'is', 'are'],
            correct: 'was',
            explanation: 'Chủ ngữ "The text book" số ít đi kèm động từ TO BE quá khứ "was".'
        },
        {
            type: 'mcq',
            question: 'Dạng viết tắt phủ định của "was not" là gì?',
            options: ["wasn't", "weren't", 'was not', 'wasn'],
            correct: "wasn't",
            explanation: '"was not" viết tắt thành "wasn\'t". ("weren\'t" dùng cho số nhiều "were not").'
        }
    ],
    lesson7: [
        {
            type: 'mcq',
            question: 'She _______ (watch) a highly exciting movie last night.',
            options: ['watch', 'watched', 'watches', 'watching'],
            correct: 'watched',
            explanation: 'Động từ "watch" là động từ có quy tắc, ở quá khứ đơn thêm đuôi "-ed" thành "watched".'
        },
        {
            type: 'mcq',
            question: 'We _______ (not play) soccer yesterday because of the heavy rain.',
            options: ["didn't play", "didn't played", 'not played', "weren't play"],
            correct: "didn't play",
            explanation: 'Phủ định quá khứ mượn "didn\'t" + động từ nguyên mẫu không chia "play".'
        },
        {
            type: 'fitb',
            question: 'I _______ (study) very hard for the final exam last night.',
            correct: ['studied'],
            explanation: '"study" kết thúc bằng phụ âm + "y", đổi "y" thành "i" rồi thêm "-ed" thành "studied".'
        },
        {
            type: 'fitb',
            question: '_______ you finish your homework on time yesterday?',
            correct: ['Did', 'did'],
            explanation: 'Câu hỏi nghi vấn động từ thường quá khứ đơn: mượn trợ động từ "Did" đảo lên đầu.'
        },
        {
            type: 'mcq',
            question: 'He _______ (stop) his car at the red traffic light.',
            options: ['stoped', 'stopped', 'stopping', 'stops'],
            correct: 'stopped',
            explanation: 'Động từ "stop" 1 âm tiết có cấu trúc nguyên âm + phụ âm tận cùng, gấp đôi phụ âm cuối rồi thêm "-ed" thành "stopped".'
        },
        {
            type: 'mcq',
            question: 'Đuôi <b>-ed</b> trong từ "wanted" được phát âm là âm gì?',
            options: ['/ɪd/', '/t/', '/d/', '/s/'],
            correct: '/ɪd/',
            explanation: 'Từ gốc "want" kết thúc bằng âm /t/, nên đuôi -ed được phát âm là /ɪd/.'
        },
        {
            type: 'mcq',
            question: 'Đuôi <b>-ed</b> trong từ "worked" được phát âm là âm gì?',
            options: ['/t/', '/d/', '/ɪd/', '/z/'],
            correct: '/t/',
            explanation: 'Từ gốc "work" kết thúc bằng âm vô thanh /k/, nên đuôi -ed phát âm là âm vô thanh /t/.'
        },
        {
            type: 'mcq',
            question: 'Đuôi <b>-ed</b> trong từ "played" được phát âm là âm gì?',
            options: ['/d/', '/t/', '/ɪd/', '/z/'],
            correct: '/d/',
            explanation: 'Từ gốc "play" kết thúc bằng nguyên âm hữu thanh, nên đuôi -ed phát âm là âm hữu thanh /d/.'
        },
        {
            type: 'mcq',
            question: 'Chọn từ có phát âm đuôi <b>-ed</b> là <b>/ɪd/</b>:',
            options: ['needed', 'played', 'watched', 'laughed'],
            correct: 'needed',
            explanation: 'Từ gốc "need" kết thúc bằng âm /d/, nên đuôi -ed đọc là /ɪd/. Các từ còn lại đọc là /t/ hoặc /d/.'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Cô ấy đã sống ở Hà Nội 5 năm trước."',
            words: ['She', 'lived', 'in', 'Hanoi', 'five', 'years', 'ago'],
            correct: 'She lived in Hanoi five years ago',
            explanation: 'Cấu trúc câu quá khứ: S + V-ed + Trạng từ chỉ nơi chốn/thời gian.'
        }
    ],
    lesson8: [
        {
            type: 'mcq',
            question: 'Yesterday, I _______ (go) to the local supermarket with my mom.',
            options: ['go', 'goes', 'went', 'gone'],
            correct: 'went',
            explanation: '"go" là động từ bất quy tắc, quá khứ cột 2 là "went".'
        },
        {
            type: 'mcq',
            question: 'My father _______ (buy) a beautiful new laptop last week.',
            options: ['buy', 'bought', 'buys', 'buyed'],
            correct: 'bought',
            explanation: '"buy" là động từ bất quy tắc, quá khứ cột 2 là "bought".'
        },
        {
            type: 'fitb',
            question: 'She _______ (have) a wonderful birthday party last night.',
            correct: ['had'],
            explanation: '"have" là động từ bất quy tắc, quá khứ cột 2 là "had".'
        },
        {
            type: 'fitb',
            question: 'What did you _______ (do) at home yesterday afternoon?',
            correct: ['do'],
            explanation: 'Trong câu hỏi mượn trợ động từ "did", động từ chính phải trở lại nguyên mẫu là "do".'
        },
        {
            type: 'mcq',
            question: 'I _______ (see) a very famous actor at the airport yesterday.',
            options: ['see', 'saw', 'seen', 'seed'],
            correct: 'saw',
            explanation: '"see" là động từ bất quy tắc, quá khứ cột 2 là "saw".'
        },
        {
            type: 'mcq',
            question: 'Dạng quá khứ quá khứ đơn (V2) của động từ "make" là gì?',
            options: ['made', 'makeed', 'makes', 'making'],
            correct: 'made',
            explanation: '"make" bất quy tắc chuyển thành "made" ở quá khứ đơn.'
        },
        {
            type: 'mcq',
            question: 'They _______ (take) many beautiful photos during their summer trip.',
            options: ['take', 'took', 'taken', 'taked'],
            correct: 'took',
            explanation: '"take" bất quy tắc chuyển thành "took" ở quá khứ.'
        },
        {
            type: 'fitb',
            question: 'He _______ (write) a heartfelt letter to his parents yesterday.',
            correct: ['wrote'],
            explanation: '"write" bất quy tắc chuyển thành quá khứ cột 2 là "wrote".'
        },
        {
            type: 'mcq',
            question: 'We _______ (eat) delicious fresh seafood at the beach restaurant.',
            options: ['eat', 'eated', 'ate', 'eating'],
            correct: 'ate',
            explanation: '"eat" bất quy tắc chuyển thành "ate" ở quá khứ.'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Cô ấy đã tặng tôi một món quà."',
            words: ['She', 'gave', 'me', 'a', 'lovely', 'present'],
            correct: 'She gave me a lovely present',
            explanation: '"give" bất quy tắc chuyển thành "gave" ở quá khứ.'
        }
    ],
    lesson9: [
        {
            type: 'mcq',
            question: 'I promise I _______ (help) you with your difficult homework tonight.',
            options: ['will help', 'help', 'am helping', 'helped'],
            correct: 'will help',
            explanation: 'Lời hứa hẹn (promise) đi kèm thì tương lai đơn sử dụng "will" + động từ nguyên mẫu.'
        },
        {
            type: 'mcq',
            question: 'She _______ (not come) to the school party tomorrow night.',
            options: ['don\'t come', "won't come", "doesn't come", "isn't come"],
            correct: "won't come",
            explanation: 'Phủ định tương lai đơn: "will not" (viết tắt là "won\'t") + động từ nguyên mẫu "come".'
        },
        {
            type: 'fitb',
            question: '_______ you be free and at home this evening?',
            correct: ['Will', 'will'],
            explanation: 'Câu nghi vấn tương lai đơn: Đảo trợ động từ "Will" lên trước chủ ngữ.'
        },
        {
            type: 'fitb',
            question: 'Don\'t worry about that, I _______ (call) you when I arrive.',
            correct: ['will call'],
            explanation: 'Quyết định tức thời ngay tại thời điểm nói sử dụng "will call".'
        },
        {
            type: 'mcq',
            question: 'I think it _______ (rain) tomorrow morning.',
            options: ['will rain', 'rains', 'rained', 'is rain'],
            correct: 'will rain',
            explanation: 'Dự đoán tương lai không có căn cứ chắc chắn (sau "I think") dùng "will rain".'
        },
        {
            type: 'mcq',
            question: 'Trợ động từ viết tắt dạng phủ định của "will not" là gì?',
            options: ["won't", "willn't", 'wont', 'not will'],
            correct: "won't",
            explanation: '"will not" viết tắt dứt khoát thành "won\'t".'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Họ sẽ đi du lịch Đà Nẵng tuần tới."',
            words: ['They', 'will', 'travel', 'to', 'Da', 'Nang', 'next', 'week'],
            correct: 'They will travel to Da Nang next week',
            explanation: 'Công thức tương lai đơn: S + will + V_nguyên_mẫu + O + thời gian tương lai.'
        },
        {
            type: 'fitb',
            question: 'Where _______ we meet tomorrow morning?',
            correct: ['will'],
            explanation: 'Câu hỏi tương lai đơn mượn trợ động từ "will" đứng trước chủ ngữ "we".'
        },
        {
            type: 'mcq',
            question: 'Perhaps he _______ (pass) the final examination easily.',
            options: ['will pass', 'passes', 'pass', 'is going to pass'],
            correct: 'will pass',
            explanation: 'Dự đoán tương lai đi kèm trạng từ phán đoán mơ hồ "Perhaps" (có lẽ) dùng "will pass".'
        },
        {
            type: 'mcq',
            question: 'Dạng viết tắt khẳng định của "I will" là gì?',
            options: ["I'll", "I'd", "I've", "I'm"],
            correct: "I'll",
            explanation: '"I will" viết tắt là "I\'ll".'
        }
    ],
    lesson10: [
        {
            type: 'mcq',
            question: 'Look at those dark black clouds! It _______ (rain) very soon.',
            options: ['will rain', 'is going to rain', 'rains', 'rained'],
            correct: 'is going to rain',
            explanation: 'Dự đoán có bằng chứng rõ ràng trước mắt (dark clouds) $\rightarrow$ Dùng tương lai gần "is going to rain".'
        },
        {
            type: 'mcq',
            question: 'We _______ (visit) our grandparents this weekend. (Kế hoạch định sẵn từ trước)',
            options: ['will visit', 'are going to visit', 'visited', 'visits'],
            correct: 'are going to visit',
            explanation: 'Kế hoạch đã chuẩn bị kỹ lưỡng từ trước $\rightarrow$ Dùng tương lai gần "are going to visit".'
        },
        {
            type: 'fitb',
            question: 'I _______ (study) English hard tonight because I have an exam tomorrow.',
            correct: ['am going to study'],
            explanation: 'Có mục đích định sẵn và có căn cứ lịch thi rõ ràng $\rightarrow$ Dùng "am going to study".'
        },
        {
            type: 'mcq',
            question: 'Phân biệt: Quyết định tức thời tại thời điểm nói dùng "will", kế hoạch có trước dùng _______.',
            options: ['be going to', 'will', 'quá khứ đơn', 'hiện tại đơn'],
            correct: 'be going to',
            explanation: 'Khác biệt cốt lõi: "will" bột phát tức thì, "be going to" kế hoạch sẵn có.'
        },
        {
            type: 'fitb',
            question: 'He is saving money. He _______ (buy) a new smartphone next month.',
            correct: ['is going to buy'],
            explanation: 'Có hành động chuẩn bị (saving money) $\rightarrow$ Dùng tương lai gần "is going to buy".'
        },
        {
            type: 'mcq',
            question: 'Thì Hiện tại đơn có thể diễn tả lịch trình cố định của xe lửa hay không?',
            options: ['Có, đây là cách dùng chuẩn', 'Không thể', 'Chỉ dùng được ở quá khứ', 'Chỉ dùng cho hoạt động con người'],
            correct: 'Có, đây là cách dùng chuẩn',
            explanation: 'Hiện tại đơn dùng để mô tả lịch trình cố định (xe tàu, máy bay, lịch chiếu phim...).'
        },
        {
            type: 'mcq',
            question: 'Động từ gốc "fix" kết thúc bằng âm xuýt /s/, đuôi <b>-es</b> phát âm là gì?',
            options: ['/ɪz/', '/s/', '/z/', '/t/'],
            correct: '/ɪz/',
            explanation: '"fix" tận cùng bằng âm /ks/, chứa âm xuýt /s/ ở cuối nên đuôi -es phát âm là /ɪz/.'
        },
        {
            type: 'mcq',
            question: 'Quá khứ của "buy" là "bought". Đây là động từ có quy tắc hay bất quy tắc?',
            options: ['Bất quy tắc', 'Có quy tắc', 'Không phải động từ', 'Không xác định được'],
            correct: 'Bất quy tắc',
            explanation: 'Động từ bất quy tắc vì nó biến đổi hoàn toàn từ "buy" sang "bought" thay vì thêm -ed.'
        },
        {
            type: 'fitb',
            question: 'Từ "went" là dạng quá khứ của động từ nguyên mẫu nào?',
            correct: ['go', 'Go'],
            explanation: '"went" là dạng quá khứ bất quy tắc của động từ nguyên mẫu "go".'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Chúng ta sẽ học tập chăm chỉ cùng nhau."',
            words: ['We', 'are', 'going', 'to', 'study', 'hard', 'together'],
            correct: 'We are going to study hard together',
            explanation: 'Cấu trúc tương lai gần: S + be going to + V_nguyên_mẫu.'
        }
    ],
    lesson11: [
        {
            type: 'mcq',
            question: 'She was born _______ 1999. (Năm sinh)',
            options: ['in', 'on', 'at', 'by'],
            correct: 'in',
            explanation: 'Dùng <b>IN</b> với các đơn vị thời gian lớn: năm (year), tháng (month), mùa (season), thập kỷ, thế kỷ. → She was born <b>in</b> 1999.'
        },
        {
            type: 'mcq',
            question: 'We have English class _______ Monday. (Thứ trong tuần)',
            options: ['on', 'in', 'at', 'for'],
            correct: 'on',
            explanation: 'Dùng <b>ON</b> với các ngày cụ thể: thứ trong tuần, ngày tháng cụ thể. → class <b>on</b> Monday.'
        },
        {
            type: 'mcq',
            question: 'The meeting starts _______ 9 o\'clock. (Giờ cụ thể)',
            options: ['at', 'in', 'on', 'by'],
            correct: 'at',
            explanation: 'Dùng <b>AT</b> với giờ chính xác, thời điểm chính xác. → starts <b>at</b> 9 o\'clock.'
        },
        {
            type: 'fitb',
            question: 'I usually go to bed _______ midnight. (Nửa đêm = thời điểm cố định)',
            correct: ['at', 'At'],
            explanation: 'Dùng <b>AT</b> với các thời điểm cố định đặc biệt: midnight (nửa đêm), noon (trưa), night, the weekend (BrE).'
        },
        {
            type: 'mcq',
            question: 'My birthday is _______ June 15th. (Ngày tháng cụ thể)',
            options: ['on', 'in', 'at', 'during'],
            correct: 'on',
            explanation: 'Dùng <b>ON</b> với ngày cụ thể (dates) và thứ cụ thể. → birthday <b>on</b> June 15th.'
        },
        {
            type: 'mcq',
            question: 'It\'s very cold here _______ winter. (Mùa đông)',
            options: ['in', 'on', 'at', 'with'],
            correct: 'in',
            explanation: 'Dùng <b>IN</b> với các mùa trong năm: in spring / summer / autumn / winter.'
        },
        {
            type: 'mcq',
            question: 'She lives _______ 45 Nguyen Hue Street. (Số nhà, địa chỉ cụ thể)',
            options: ['at', 'in', 'on', 'by'],
            correct: 'at',
            explanation: 'Dùng <b>AT</b> với địa chỉ nhà cụ thể (số nhà). → lives <b>at</b> 45 Nguyen Hue Street.'
        },
        {
            type: 'mcq',
            question: 'He works _______ a hospital. (Trong một tòa nhà/tổ chức)',
            options: ['in', 'at', 'on', 'inside'],
            correct: 'in',
            explanation: 'Dùng <b>IN</b> khi nói ai đó bên trong một không gian/tòa nhà. Dùng <b>AT</b> khi nhấn mạnh địa điểm mang tính chức năng (at the hospital = đến bệnh viện để chữa bệnh/làm việc). Cả hai đều đúng nhưng "in" nhấn mạnh không gian vật lý bên trong.'
        },
        {
            type: 'fitb',
            question: 'The book is _______ the table. (Đang ở trên bàn)',
            correct: ['on', 'On'],
            explanation: 'Dùng <b>ON</b> khi vật thể đang nằm trên bề mặt (surface) của một vật khác. → The book is <b>on</b> the table.'
        },
        {
            type: 'order',
            question: 'Hãy xếp thành câu đúng: "Chúng tôi đã gặp nhau lúc 8 giờ vào sáng thứ Hai."',
            words: ['We', 'met', 'at', '8', 'o\'clock', 'on', 'Monday', 'morning'],
            correct: 'We met at 8 o\'clock on Monday morning',
            explanation: 'Dùng <b>AT</b> cho giờ cụ thể và <b>ON</b> cho thứ trong tuần. Thứ tự chuẩn: AT (giờ) + ON (thứ/ngày) + buổi.'
        }
    ]
};

// ======================================================
//   LESSONS & PERSONALIZED PROFILE SUPPORT FUNCTIONS
// ======================================================

const lessonList = [
    { id: 'lesson1', title: 'Bài 1: IPA & Nguyên âm đơn', desc: 'Làm quen bảng IPA quốc tế và cách phát âm 12 nguyên âm đơn chuẩn xác.', badge: 'Phát âm' },
    { id: 'lesson2', title: 'Bài 2: Nguyên âm đôi & Phụ âm', desc: 'Bí quyết làm chủ các nguyên âm đôi và phân biệt phụ âm vô thanh/hữu thanh.', badge: 'Phát âm' },
    { id: 'lesson3', title: 'Bài 3: Hiện tại đơn - TO BE', desc: 'Công thức, cách dùng của am/is/are ở thể khẳng định, phủ định và nghi vấn.', badge: 'Ngữ pháp' },
    { id: 'lesson4', title: 'Bài 4: Hiện tại đơn - Động từ thường', desc: 'Cách chia động từ thường, mượn trợ động từ Do/Does chuẩn ngữ pháp.', badge: 'Ngữ pháp' },
    { id: 'lesson5', title: 'Bài 5: Cách phát âm đuôi -s/-es', desc: 'Cầu nối phát âm: Nắm vững quy tắc sibilant, vô thanh, hữu thanh.', badge: 'Cầu nối' },
    { id: 'lesson6', title: 'Bài 6: Quá khứ đơn - TO BE', desc: 'Cách kể về trạng thái, sự việc đã kết thúc bằng động từ was/were.', badge: 'Ngữ pháp' },
    { id: 'lesson7', title: 'Bài 7: Quá khứ đơn - Động từ thường', desc: 'Cách chia động từ có quy tắc thêm đuôi -ed và mẹo phát âm chuẩn.', badge: 'Ngữ pháp' },
    { id: 'lesson8', title: 'Bài 8: Động từ Bất quy tắc thông dụng', desc: 'Làm quen các động từ bất quy tắc thiết yếu hay gặp nhất (go, buy, have...).', badge: 'Từ vựng' },
    { id: 'lesson9', title: 'Bài 9: Thì Tương lai đơn với WILL', desc: 'Diễn tả lời hứa, quyết định tức thì và các câu nghi vấn tương lai.', badge: 'Ngữ pháp' },
    { id: 'lesson10', title: 'Bài 10: BE GOING TO & Tổng ôn tập', desc: 'Phân biệt ý định có sẵn với quyết định bột phát và bài tập tổng kết.', badge: 'Tổng hợp' },
    { id: 'lesson11', title: 'Bài 11: Giới từ IN / ON / AT', desc: 'Bí kíp phân biệt giới từ thời gian và nơi chốn IN, ON, AT – không bao giờ nhầm lẫn nữa!', badge: 'Ngữ pháp' }
];

function initUserProfile() {
    const savedName = localStorage.getItem('easy_english_username');
    const overlay = document.getElementById('welcome-modal-overlay');
    if (savedName) {
        currentUsername = savedName;
        updateUserProfileUI();
        if (overlay) overlay.classList.add('hidden');
    } else {
        if (overlay) overlay.classList.remove('hidden');
    }
}

function submitWelcomeName() {
    const input = document.getElementById('welcome-name-input');
    const name = input ? input.value.trim() : '';
    if (!name) {
        alert('Vui lòng nhập tên của bạn nhé!');
        return;
    }
    currentUsername = name;
    localStorage.setItem('easy_english_username', name);
    updateUserProfileUI();
    const overlay = document.getElementById('welcome-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    alert(`Chào mừng ${name} đến với Easy English! Chúc bạn học tập vui vẻ! 🎉`);
}

function updateUserProfileUI() {
    const nameDisplays = document.querySelectorAll('#user-name-display');
    const avatarEl = document.getElementById('user-avatar');
    nameDisplays.forEach(el => {
        el.textContent = currentUsername;
    });
    if (avatarEl && currentUsername) {
        avatarEl.textContent = currentUsername.charAt(0).toUpperCase();
        const charCode = currentUsername.charCodeAt(0);
        const hue = (charCode * 37) % 360; // stable randomized hue
        avatarEl.style.backgroundColor = `hsl(${hue}, 65%, 50%)`;
    }
}

function promptChangeName() {
    const newName = prompt('Nhập tên học viên mới của bạn:', currentUsername);
    if (newName && newName.trim() !== '') {
        currentUsername = newName.trim();
        localStorage.setItem('easy_english_username', currentUsername);
        updateUserProfileUI();
        alert('Đã đổi tên học viên thành công! 🌟');
    }
}

function renderLessonsGrid() {
    const grid = document.getElementById('lessons-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let completedCount = 0;
    lessonList.forEach((lesson, index) => {
        const score = lessonScores[lesson.id];
        const isCompleted = (score !== undefined);
        if (isCompleted) completedCount++;
        
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.onclick = () => selectLesson(lesson.id);
        
        const badgeClass = isCompleted ? 'lesson-badge completed' : 'lesson-badge';
        const badgeText = isCompleted ? 'Đã hoàn thành ✓' : lesson.badge;
        const scoreText = isCompleted ? `${score}/10` : 'Chưa làm';
        const scoreClass = isCompleted && score >= 8 ? 'lesson-score high-score' : 'lesson-score';
        
        card.innerHTML = `
            <div class="lesson-card-header">
                <span class="${badgeClass}">${badgeText}</span>
                <span class="lesson-index">Bài ${String(index + 1).padStart(2, '0')}</span>
            </div>
            <div class="lesson-card-body">
                <h4>${lesson.title}</h4>
                <p>${lesson.desc}</p>
            </div>
            <div class="lesson-card-footer">
                <span class="${scoreClass}">Đạt: ${scoreText}</span>
                <span class="lesson-action-lbl">Vào học ➔</span>
            </div>
        `;
        grid.appendChild(card);
    });
    
    const ttlScoreEl = document.getElementById('total-lessons-score');
    const compRatioEl = document.getElementById('completed-lessons-ratio');
    if (ttlScoreEl) ttlScoreEl.textContent = currentScore;
    if (compRatioEl) compRatioEl.textContent = `${completedCount}/10`;
}

function selectLesson(lessonId) {
    currentPracticeTopic = lessonId;
    currentQuestionIndex = 0;
    currentLessonCorrectAnswers = 0;
    
    const nextBtn = document.getElementById('btn-next-question');
    if (nextBtn) {
        nextBtn.textContent = 'Tiếp tục ➔';
        nextBtn.onclick = () => nextQuestion();
    }
    
    const lesson = lessonList.find(l => l.id === lessonId);
    const titleEl = document.getElementById('quiz-lesson-title');
    if (titleEl) titleEl.textContent = lesson ? lesson.title : 'Luyện tập';
    
    const csEl = document.getElementById('current-score');
    const acEl = document.getElementById('answered-count');
    if (csEl) csEl.textContent = '0';
    if (acEl) acEl.textContent = '0';
    
    const selectorView = document.getElementById('lesson-selector-view');
    const playView = document.getElementById('quiz-play-view');
    if (selectorView) selectorView.classList.add('hidden');
    if (playView) playView.classList.remove('hidden');
    
    loadQuestion();
}

function completeLesson() {
    document.getElementById('options-container').classList.add('hidden');
    document.getElementById('input-container').classList.add('hidden');
    document.getElementById('word-order-container').classList.add('hidden');
    document.getElementById('sound-game-container').classList.add('hidden');
    
    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.classList.remove('hidden');
    feedbackBox.className = 'feedback-box correct';
    
    const fbStatus = document.getElementById('feedback-status');
    const fbMessage = document.getElementById('feedback-message');
    const fbExplanation = document.getElementById('feedback-explanation');
    const nextBtn = document.getElementById('btn-next-question');
    
    const oldHighScore = lessonScores[currentPracticeTopic] || 0;
    const isNewHigh = currentLessonCorrectAnswers > oldHighScore;
    lessonScores[currentPracticeTopic] = Math.max(oldHighScore, currentLessonCorrectAnswers);
    
    if (isNewHigh) {
        currentScore += (currentLessonCorrectAnswers - oldHighScore) * 10;
    }
    
    saveProgressToStorage();
    
    fbStatus.textContent = '🎉 BÀI HỌC HOÀN THÀNH! 🎉';
    
    let comment = '';
    if (currentLessonCorrectAnswers === 10) {
        comment = 'Tuyệt đối! Bạn là một bậc thầy thực thụ! 🏆';
        triggerConfettiEffect();
    } else if (currentLessonCorrectAnswers >= 8) {
        comment = 'Tuyệt vời! Bạn nắm vững bài học rất tốt. 🌟';
        triggerConfettiEffect();
    } else if (currentLessonCorrectAnswers >= 5) {
        comment = 'Khá tốt! Bạn đã vượt qua thử thách này. Hãy ôn luyện thêm nhé! 📚';
    } else {
        comment = 'Cố gắng lên! Hãy xem lại lý thuyết và làm lại bài học để nâng cao điểm số nhé! 💪';
    }
    
    fbMessage.innerHTML = `
        <div style="font-size: 1.15rem; margin-bottom: 0.5rem; text-align: center; font-weight:700;">
            Kết quả của bạn: <span style="color: var(--success-light); font-size: 1.35rem;">${currentLessonCorrectAnswers}/10</span> câu đúng!
        </div>
        <div style="text-align: center; color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem;">
            ${comment}
        </div>
    `;
    fbExplanation.textContent = 'Bấm nút bên dưới để quay lại màn hình chọn bài tập và tiếp tục chinh phục bài học khác.';
    
    nextBtn.textContent = 'Quay lại danh sách bài ⬅';
    nextBtn.onclick = () => exitQuizToLessons();
    
    updateProgressTab();
}

function exitQuizToLessons() {
    const playView = document.getElementById('quiz-play-view');
    const selectorView = document.getElementById('lesson-selector-view');
    if (playView) playView.classList.add('hidden');
    if (selectorView) selectorView.classList.remove('hidden');
    renderLessonsGrid();
}


// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const dateDisplay = document.getElementById('date-display');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString('vi-VN', options);

    // Dynamic setup of voices
    initSpeechSynthesisVoices();

    // Render the IPA Board dynamically
    renderIPABoard();

    // Setup Double Click to Translate on learning contents
    setupClickToTranslate();

    // Setup global window click listener to dismiss bubble
    document.addEventListener('click', (e) => {
        const bubble = document.getElementById('translate-bubble');
        if (bubble && !bubble.contains(e.target) && !e.target.classList.contains('highlight-word')) {
            closeTranslateBubble();
        }
    });

    // Personalized User Setup
    initUserProfile();

    // Render lessons grid initially
    renderLessonsGrid();

    // Load initial quiz & setup
    resetQuiz();
    updateProgressUI();
});

// Speech Synthesis Accents setup
function initSpeechSynthesisVoices() {
    if ('speechSynthesis' in window) {
        // Load voices initially
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            // Search for US voice
            usVoice = voices.find(v => v.lang.startsWith('en-US') && (v.name.includes('Google') || v.name.includes('Natural')));
            if (!usVoice) usVoice = voices.find(v => v.lang.startsWith('en-US'));

            // Search for UK voice
            ukVoice = voices.find(v => v.lang.startsWith('en-GB') && (v.name.includes('Google') || v.name.includes('Natural')));
            if (!ukVoice) ukVoice = voices.find(v => v.lang.startsWith('en-GB'));
        };
    }
}

// Tab Switching Logic
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update navigation active states
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`btn-tab-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Switch active section content
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(`tab-${tabName}`);
    if (activeSection) activeSection.classList.add('active');

    // Title Badge / Header text sync
    const mainTitle = document.getElementById('main-title');
    if (tabName === 'ipa') {
        mainTitle.innerHTML = 'Mục 1: Phát âm & Khẩu hình <span class="badge">IPA Guide</span>';
    } else if (tabName === 'grammar') {
        mainTitle.innerHTML = 'Ngữ Pháp: Thì Hiện Tại Đơn <span class="badge">Present Simple</span>';
    } else if (tabName === 'past') {
        mainTitle.innerHTML = 'Ngữ Pháp: Thì Quá Khứ Đơn <span class="badge">Past Simple</span>';
    } else if (tabName === 'future') {
        mainTitle.innerHTML = 'Ngữ Pháp: Thì Tương Lai Đơn <span class="badge">Future Simple</span>';
    } else if (tabName === 'practice') {
        mainTitle.innerHTML = 'Luyện tập Tương tác <span class="badge">Interactive Quiz</span>';
        const selectorView = document.getElementById('lesson-selector-view');
        const playView = document.getElementById('quiz-play-view');
        if (selectorView) selectorView.classList.remove('hidden');
        if (playView) playView.classList.add('hidden');
        renderLessonsGrid();
    } else if (tabName === 'dict') {
        mainTitle.innerHTML = 'Từ Điển & Tra Phát Âm <span class="badge">Dictionary & Pronunciation</span>';
        // Auto-focus the search input when switching to dict tab
        setTimeout(() => {
            const inp = document.getElementById('dict-main-input');
            if (inp) inp.focus();
        }, 200);
    } else if (tabName === 'progress') {
        mainTitle.innerHTML = 'Tiến trình & Sổ tay từ vựng <span class="badge">Progress & Vocab</span>';
        updateProgressTab();
    }
}

// Sub-Tab Switching Logic (Grammar Mode)
function switchSubTab(event, subTabId) {
    const parentContainer = event.target.closest('.tab-sub-container');
    
    // Remove active from buttons
    parentContainer.querySelectorAll('.tab-sub-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active to current button
    event.target.classList.add('active');
    
    // Hide all sub-tab contents
    parentContainer.querySelectorAll('.tab-sub-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show current sub-tab content
    parentContainer.querySelector(`#${subTabId}`).classList.add('active');
}

// Switch Practice Topic
function switchPracticeTopic(topicName) {
    currentPracticeTopic = topicName;
    
    // Toggle active classes on selector buttons
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`btn-topic-${topicName}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Initialize infinite shuffled pool for grammar/ipa topics
    if (topicName !== 'game') {
        const topicQuestions = questionsDatabase[topicName] || [];
        shuffledQuestionPool = shuffleArray(topicQuestions.map((_, i) => i));
        poolPosition = 0;
        currentQuestionIndex = shuffledQuestionPool[0] ?? 0;
    } else {
        usedGameWordIndices = []; // reset game word pool
    }
    
    loadQuestion();
    updateProgressUI();
}

// Render IPA board
function renderIPABoard() {
    const monophthongsContainer = document.getElementById('monophthongs-container');
    const diphthongsContainer = document.getElementById('diphthongs-container');
    const consonantsContainer = document.getElementById('consonants-container');

    if (!monophthongsContainer) return;

    monophthongsContainer.innerHTML = '';
    diphthongsContainer.innerHTML = '';
    consonantsContainer.innerHTML = '';

    allIpaSounds.forEach(sound => {
        const cell = document.createElement('button');
        cell.className = `ipa-cell ${sound.type}`;
        cell.innerHTML = `
            <span>${sound.symbol}</span>
            <span class="sound-name-tag">${sound.voicing === 'voiced' ? 'Hữu' : 'Vô'}</span>
        `;
        cell.onclick = () => selectIPASound(sound, cell);

        if (sound.type === 'long-vowel' || sound.type === 'short-vowel') {
            monophthongsContainer.appendChild(cell);
        } else if (sound.type === 'diphthong') {
            diphthongsContainer.appendChild(cell);
        } else {
            consonantsContainer.appendChild(cell);
        }
    });
}

// Select specific IPA sound on grid click
function selectIPASound(sound, cellElement) {
    // Clear active sound class on all
    document.querySelectorAll('.ipa-cell').forEach(c => {
        c.classList.remove('active-sound');
    });
    
    cellElement.classList.add('active-sound');

    // Show details panel
    const emptyState = document.getElementById('panel-empty-state');
    const panelContent = document.getElementById('panel-content');
    
    emptyState.classList.add('hidden');
    panelContent.classList.remove('hidden');

    // Set panel texts
    document.getElementById('panel-sound-type').textContent = getVietnameseTypeName(sound.type);
    document.getElementById('panel-sound-symbol').textContent = sound.symbol;
    document.getElementById('panel-sound-name').textContent = sound.name;

    // Set instructions
    const instructionList = document.getElementById('mouth-instructions-list');
    instructionList.innerHTML = '';
    sound.description.forEach(desc => {
        const li = document.createElement('li');
        li.textContent = desc;
        instructionList.appendChild(li);
    });

    // Set examples
    const exampleList = document.getElementById('sound-example-list');
    exampleList.innerHTML = '';
    sound.examples.forEach(ex => {
        const div = document.createElement('div');
        div.className = 'example-row';
        div.innerHTML = `
            <div>
                <span class="example-word-text highlight-word" onclick="translateWordClick('${ex.word}')">${ex.word}</span> 
                <span class="example-word-ipa">${ex.ipa}</span>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${ex.text}</div>
            </div>
            <button class="btn-tts" onclick="speakText('${ex.word}')" title="Nghe phát âm">🔊</button>
        `;
        exampleList.appendChild(div);
    });

    // Render mouth shape SVG dynamically!
    drawMouthSVG(sound.symbol);

    // Speak the sound symbol itself!
    speakIPASound(sound.symbol);
}

// Render dynamic face profile SVG based on sound parameters
// Render dynamic front-facing + side-profile SVG based on sound parameters
function drawMouthSVG(target, symbol) {
    let svg;
    let sym = symbol;
    if (!symbol) {
        svg = document.getElementById('mouth-svg');
        sym = target;
    } else {
        svg = typeof target === 'string' ? document.getElementById(target) : target;
    }
    if (!svg) return;
    
    let lipsProfile = "neutral";
    let tongueProfile = "neutral";
    let voiceActive = true;
    
    const soundData = allIpaSounds.find(s => s.symbol === sym);
    if (soundData) {
        voiceActive = (soundData.voicing === "voiced");
        
        // Categorize profile based on details
        if (["/i:/", "/ɪ/", "/e/", "/æ/"].includes(sym)) {
            lipsProfile = "open-spread";
            tongueProfile = sym === "/i:/" || sym === "/ɪ/" ? "high-front" : "low-front";
        } else if (["/u:/", "/ʊ/", "/ɔ:/", "/ɒ/"].includes(sym)) {
            lipsProfile = "open-round";
            tongueProfile = sym === "/u:/" || sym === "/ʊ/" ? "high-back" : "low-back";
        } else if (["/ʌ/", "/ɑ:/", "/ə/", "/ɜ:/"].includes(sym)) {
            lipsProfile = "neutral";
            tongueProfile = sym === "/ɑ:/" ? "low-back" : "neutral";
        } else if (["/p/", "/b/", "/m/"].includes(sym)) {
            lipsProfile = "closed";
            tongueProfile = "neutral";
        } else if (["/f/", "/v/"].includes(sym)) {
            lipsProfile = "lip-bite";
            tongueProfile = "neutral";
        } else if (["/θ/", "/ð/"].includes(sym)) {
            lipsProfile = "narrow";
            tongueProfile = "touch-teeth";
        } else if (["/t/", "/d/", "/n/", "/l/", "/s/", "/z/"].includes(sym)) {
            lipsProfile = "narrow";
            tongueProfile = "touch-alveolar";
        } else if (["/k/", "/g/", "/ŋ/"].includes(sym)) {
            lipsProfile = "narrow";
            tongueProfile = "velar-block";
        }
    }

    // SVG linear gradients definitions (defs)
    const defs = `
        <defs>
            <linearGradient id="lipsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff758c" />
                <stop offset="100%" stop-color="#ff7eb3" />
            </linearGradient>
            <linearGradient id="palateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(56, 189, 248, 0.15)" />
                <stop offset="100%" stop-color="rgba(56, 189, 248, 0.02)" />
            </linearGradient>
            <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fd79a8" />
                <stop offset="100%" stop-color="#e84393" />
            </linearGradient>
        </defs>
    `;

    // FRONT VIEW rendering paths (X: 10 -> 95)
    let frontCavity = "";
    let frontTeeth = "";
    let frontTongue = "";
    let frontLips = "";

    if (lipsProfile === "closed") {
        frontLips = `
            <path d="M 22 65 C 32 58, 48 58, 55 62 C 62 58, 78 58, 88 65 C 78 67, 55 68, 22 65 Z" fill="url(#lipsGrad)" />
            <path d="M 22 65 C 38 73, 72 73, 88 65 C 78 70, 55 70, 22 65 Z" fill="url(#lipsGrad)" />
            <line x1="22" y1="65" x2="88" y2="65" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
        `;
    } else if (lipsProfile === "open-spread") {
        frontCavity = `<path d="M 26 65 Q 55 42 84 65 Q 55 88 26 65 Z" fill="rgba(17,17,17,0.95)" stroke="rgba(255,255,255,0.05)" />`;
        frontTeeth = `
            <!-- Upper Teeth -->
            <path d="M 34 52 H 76 V 59 H 34 Z" fill="#ffffff" rx="1" />
            <path d="M 42 52 V 59 M 50 52 V 59 M 60 52 V 59 M 68 52 V 59" stroke="rgba(0,0,0,0.12)" stroke-width="1" />
            <!-- Lower Teeth -->
            <path d="M 37 70 H 73 V 77 H 37 Z" fill="#ffffff" rx="1" />
            <path d="M 44 70 V 77 M 51 70 V 77 M 59 70 V 77 M 66 70 V 77" stroke="rgba(0,0,0,0.12)" stroke-width="1" />
        `;
        if (tongueProfile === "touch-teeth") {
            frontTongue = `<path d="M 40 65 Q 55 58 70 65 Q 70 73 55 73 Q 40 73 40 65 Z" fill="url(#tongueGrad)" />`;
        } else if (tongueProfile.startsWith("high")) {
            frontTongue = `<path d="M 32 68 Q 55 58 78 68 Q 55 85 32 68 Z" fill="url(#tongueGrad)" opacity="0.8" />`;
        } else {
            frontTongue = `<path d="M 30 76 Q 55 70 80 76 Q 55 86 30 76 Z" fill="url(#tongueGrad)" />`;
        }
        frontLips = `
            <path d="M 18 65 Q 40 37 55 42 Q 70 37 92 65 Q 70 51 55 53 Q 40 51 18 65 Z" fill="url(#lipsGrad)" />
            <path d="M 18 65 Q 55 93 92 65 Q 70 77 55 79 Q 40 77 18 65 Z" fill="url(#lipsGrad)" />
        `;
    } else if (lipsProfile === "open-round") {
        frontCavity = `<circle cx="55" cy="65" r="14" fill="rgba(17,17,17,0.95)" />`;
        frontTeeth = `
            <path d="M 47 58 Q 55 61 63 58 V 59 Q 55 62 47 59 Z" fill="#ffffff" />
            <path d="M 48 71 Q 55 68 62 71 V 70 Q 55 67 48 70 Z" fill="#ffffff" />
        `;
        frontLips = `
            <path d="M 33 65 A 22 22 0 1 1 77 65 A 22 22 0 1 1 33 65 Z M 43 65 A 12 12 0 1 0 67 65 A 12 12 0 1 0 43 65 Z" fill="url(#lipsGrad)" fill-rule="evenodd" />
        `;
    } else if (lipsProfile === "lip-bite") {
        frontCavity = `<path d="M 28 62 Q 55 48 82 62 Q 55 76 28 62 Z" fill="rgba(17,17,17,0.95)" />`;
        frontTeeth = `
            <path d="M 34 53 H 76 V 65 H 34 Z" fill="#ffffff" rx="1" />
            <path d="M 42 53 V 65 M 50 53 V 65 M 60 53 V 65 M 68 53 V 65" stroke="rgba(0,0,0,0.12)" stroke-width="1" />
        `;
        frontLips = `
            <path d="M 20 62 Q 40 40 55 44 Q 70 40 90 62 Q 70 51 55 53 Q 40 51 20 62 Z" fill="url(#lipsGrad)" />
            <path d="M 20 68 Q 55 86 90 68 Q 70 73 55 73 Q 40 73 20 68 Z" fill="url(#lipsGrad)" />
        `;
    } else { // narrow / neutral
        frontCavity = `<path d="M 28 65 Q 55 48 82 65 Q 55 82 28 65 Z" fill="rgba(17,17,17,0.95)" />`;
        frontTeeth = `
            <path d="M 36 55 H 74 V 60 H 36 Z" fill="#ffffff" rx="0.5" />
            <path d="M 38 70 H 72 V 75 H 38 Z" fill="#ffffff" rx="0.5" />
        `;
        if (tongueProfile === "touch-teeth") {
            frontTongue = `<path d="M 42 65 Q 55 59 68 65 Q 68 71 55 71 Q 42 71 42 65 Z" fill="url(#tongueGrad)" />`;
        } else if (tongueProfile === "touch-alveolar") {
            frontTongue = `<path d="M 36 68 Q 55 62 74 68 Q 55 78 36 68 Z" fill="url(#tongueGrad)" opacity="0.8" />`;
        }
        frontLips = `
            <path d="M 22 65 Q 40 45 55 49 Q 70 45 88 65 Q 70 55 55 57 Q 40 55 22 65 Z" fill="url(#lipsGrad)" />
            <path d="M 22 65 Q 55 85 88 65 Q 70 72 55 74 Q 40 72 22 65 Z" fill="url(#lipsGrad)" />
        `;
    }

    // SIDE VIEW rendering paths (X: 105 -> 195)
    let sideTeeth = `
        <rect x="156" y="44" width="4" height="8" rx="1" fill="#ffffff" />
        <rect x="156" y="78" width="4" height="8" rx="1" fill="#ffffff" />
    `;

    // Lips side
    let sideLips = "";
    if (lipsProfile === "closed") {
        sideLips = `
            <path d="M 148 55 Q 155 58 152 62" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 148 70 Q 155 67 152 62" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
        `;
    } else if (lipsProfile === "open-spread") {
        sideLips = `
            <path d="M 145 38 Q 153 41 150 46" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 145 88 Q 153 85 150 80" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
        `;
    } else if (lipsProfile === "open-round") {
        sideLips = `
            <path d="M 142 42 Q 155 45 150 49" fill="none" stroke="url(#lipsGrad)" stroke-width="5.5" stroke-linecap="round" />
            <path d="M 142 84 Q 155 81 150 77" fill="none" stroke="url(#lipsGrad)" stroke-width="5.5" stroke-linecap="round" />
        `;
    } else if (lipsProfile === "lip-bite") {
        sideLips = `
            <path d="M 145 38 Q 153 41 150 46" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 144 88 Q 154 82 153 72" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
        `;
    } else {
        sideLips = `
            <path d="M 146 41 Q 153 43 150 48" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 146 85 Q 153 83 150 78" fill="none" stroke="url(#lipsGrad)" stroke-width="4.5" stroke-linecap="round" />
        `;
    }

    // Tongue side
    let sideTongue = "";
    if (tongueProfile === "high-front") {
        sideTongue = "M 180 112 C 172 74, 158 55, 146 64 C 148 76, 160 90, 180 112 Z";
    } else if (tongueProfile === "low-front") {
        sideTongue = "M 180 112 C 172 88, 154 78, 144 83 C 146 90, 160 100, 180 112 Z";
    } else if (tongueProfile === "high-back") {
        sideTongue = "M 180 112 C 170 60, 158 72, 148 84 C 151 93, 162 102, 180 112 Z";
    } else if (tongueProfile === "low-back") {
        sideTongue = "M 180 112 C 174 88, 162 84, 152 89 C 155 96, 164 102, 180 112 Z";
    } else if (tongueProfile === "touch-teeth") {
        sideTongue = "M 180 112 C 170 82, 156 68, 140 68 C 142 76, 162 94, 180 112 Z";
    } else if (tongueProfile === "touch-alveolar") {
        sideTongue = "M 180 112 C 170 78, 158 52, 150 52 C 152 64, 162 90, 180 112 Z";
    } else if (tongueProfile === "velar-block") {
        sideTongue = "M 180 112 C 162 60, 156 75, 151 86 C 154 92, 162 102, 180 112 Z";
    } else { // neutral
        sideTongue = "M 180 112 C 170 82, 156 72, 148 78 C 151 88, 162 99, 180 112 Z";
    }

    // Vocal cords side
    let sideVocalCords = "";
    if (voiceActive) {
        sideVocalCords = "M 182 116 Q 184 118 182 120 T 182 124 T 182 128";
    } else {
        sideVocalCords = "M 182 116 L 182 128";
    }

    // SVG Full Code assembly
    svg.innerHTML = `
        ${defs}
        <!-- Divider Line between Front and Side view -->
        <line x1="102" y1="15" x2="102" y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="3,3" />

        <!-- 1. LEFT SIDE: FRONT VIEW OF MOUTH -->
        <g id="front-view">
            <!-- Background cavity -->
            ${frontCavity}
            <!-- Tongue -->
            ${frontTongue}
            <!-- Teeth -->
            ${frontTeeth}
            <!-- Lips -->
            ${frontLips}
        </g>

        <!-- 2. RIGHT SIDE: SIDE CROSS-SECTION OF VOCAL TRACT -->
        <g id="side-view">
            <!-- Palate / cavity profile -->
            <path d="M 120 25 C 138 25, 155 30, 162 42 C 168 50, 171 62, 171 85 C 171 100, 166 112, 166 122" fill="url(#palateGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
            <path d="M 120 128 C 132 128, 142 124, 148 116" fill="url(#palateGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
            
            <!-- Tongue -->
            <path d="${sideTongue}" fill="url(#tongueGrad)" stroke="#e84393" stroke-width="2" stroke-linejoin="round" class="svg-path-transition" />
            
            <!-- Teeth -->
            ${sideTeeth}
            
            <!-- Lips -->
            ${sideLips}
            
            <!-- Vocal Cords vibration -->
            <path d="${sideVocalCords}" fill="none" stroke="${voiceActive ? 'var(--success-light)' : 'var(--text-muted)'}" stroke-width="2.5" stroke-linecap="round" ${voiceActive ? '' : 'stroke-dasharray="2,2"'} />
        </g>

        <!-- Dynamic Labels -->
        <text x="52" y="140" fill="var(--text-muted)" font-size="8" font-weight="600" text-anchor="middle">Mặt Trước (Lips)</text>
        <text x="150" y="140" fill="var(--text-muted)" font-size="8" font-weight="600" text-anchor="middle">Mặt Nghiêng (Tongue)</text>
    `;

    // Panel styling reflecting voicing state
    const isDict = svg.id === 'dict-mouth-svg';
    const waveId = isDict ? 'dict-voice-wave' : 'voice-wave-animation';
    const statusId = isDict ? 'dict-voicing-status' : 'voicing-status';
    const textId = isDict ? 'dict-voicing-text' : 'voicing-text';

    const waveEl = document.getElementById(waveId);
    const voicingStatus = document.getElementById(statusId);
    const voicingText = document.getElementById(textId);
    
    if (voicingStatus && voicingText) {
        if (voiceActive) {
            voicingStatus.className = "voicing-status voiced";
            voicingText.textContent = isDict 
                ? "🔔 Hữu thanh – Đặt tay lên cổ, cảm nhận rung khi phát âm" 
                : "Hữu thanh (Voiced - Rung cổ họng)";
            if (waveEl) waveEl.style.display = "inline-block";
        } else {
            voicingStatus.className = "voicing-status voiceless";
            voicingText.textContent = isDict 
                ? "🔕 Vô thanh – Hơi thở thoát ra, không rung cổ họng" 
                : "Vô thanh (Voiceless - Chỉ bật hơi)";
            if (waveEl) waveEl.style.display = "none";
        }
    }
}

// Convert sound type keys to Vietnamese labels
function getVietnameseTypeName(type) {
    switch (type) {
        case 'short-vowel': return 'Nguyên âm đơn ngắn';
        case 'long-vowel': return 'Nguyên âm đơn dài';
        case 'diphthong': return 'Nguyên âm đôi';
        case 'voiceless-consonant': return 'Phụ âm vô thanh';
        case 'voiced-consonant': return 'Phụ âm hữu thanh';
        default: return 'Âm IPA';
    }
}

// Web Speech Speak IPA helper
function speakIPASound(symbol) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Since synthesis doesn't speak bare IPA symbols well, we translate symbol to phonetic equivalents for speech
        let speechString = symbol;
        
        // Custom adjustments to make SpeechSynthesis pronounce bare symbols correctly
        const pronunciationMap = {
            "/i:/": "ee", "/ɪ/": "ih", "/e/": "eh", "/æ/": "ah", "/ʌ/": "uh", "/ɑ:/": "ah",
            "/ɒ/": "ah", "/ɔ:/": "aw", "/ʊ/": "uuh", "/u:/": "ooh", "/ə/": "uh", "/ɜ:/": "er",
            "/eɪ/": "ay", "/aɪ/": "eye", "/ɔɪ/": "oy", "/aʊ/": "ow", "/əʊ/": "oh", "/ɪə/": "ear",
            "/eə/": "air", "/ʊə/": "oor",
            "/p/": "p", "/b/": "b", "/t/": "t", "/d/": "d", "/k/": "k", "/g/": "g",
            "/f/": "f", "/v/": "v", "/θ/": "th", "/ð/": "the", "/s/": "s", "/z/": "z",
            "/ʃ/": "sh", "/ʒ/": "zh", "/tʃ/": "ch", "/dʒ/": "j",
            "/m/": "m", "/n/": "n", "/ŋ/": "ng", "/h/": "h", "/l/": "l", "/r/": "r",
            "/w/": "w", "/j/": "y"
        };

        if (pronunciationMap[symbol]) {
            speechString = pronunciationMap[symbol];
        }

        const utterance = new SpeechSynthesisUtterance(speechString);
        utterance.lang = 'en-US';
        utterance.rate = 0.6;
        if (usVoice) utterance.voice = usVoice;
        window.speechSynthesis.speak(utterance);
    }
}

// Text-to-Speech (TTS) engine with voice selection options
function speakText(text, accent = 'us') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;

        if (accent === 'uk') {
            utterance.lang = 'en-GB';
            if (ukVoice) utterance.voice = ukVoice;
        } else {
            utterance.lang = 'en-US';
            if (usVoice) utterance.voice = usVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Trình duyệt của bạn không hỗ trợ phát âm tự động.');
    }
}

// Interactive Quiz Logic Loader
function loadQuestion() {
    // Hide all layouts
    document.getElementById('options-container').classList.add('hidden');
    document.getElementById('input-container').classList.add('hidden');
    document.getElementById('word-order-container').classList.add('hidden');
    document.getElementById('sound-game-container').classList.add('hidden');
    document.getElementById('feedback-box').classList.add('hidden');
    
    // Clear illustrations
    const imageContainer = document.getElementById('question-image-container');
    imageContainer.innerHTML = '';

    // Handle game topic separately
    if (currentPracticeTopic === 'game') {
        loadSoundGameQuestion();
        return;
    }

    const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
    if (topicQuestions.length === 0) return;

    if (currentPracticeTopic && currentPracticeTopic.startsWith('lesson')) {
        const qIndexEl = document.getElementById('lesson-q-index');
        if (qIndexEl) qIndexEl.textContent = `Câu ${currentQuestionIndex + 1}/10`;
        
        const progBar = document.getElementById('practice-progress');
        if (progBar) progBar.style.width = `${(currentQuestionIndex / 10) * 100}%`;
    }

    const q = topicQuestions[currentQuestionIndex];
    const typeBadge = document.getElementById('quiz-type-badge');
    const questionText = document.getElementById('question-text');
    
    // Render dynamic visual illustration using SVGs!
    if (q.illustration) {
        imageContainer.innerHTML = generateSVGIllustration(q.illustration);
    }

    // Set Question text
    questionText.innerHTML = q.question;
    
    if (q.type === 'mcq') {
        typeBadge.textContent = 'Trắc nghiệm';
        typeBadge.style.borderColor = 'rgba(99, 102, 241, 0.2)';
        typeBadge.style.color = 'var(--primary-light)';
        
        const optContainer = document.getElementById('options-container');
        optContainer.innerHTML = '';
        optContainer.classList.remove('hidden');
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span>${opt}</span> <span class="opt-icon"></span>`;
            btn.onclick = () => checkMCQAnswer(btn, opt, q.correct);
            optContainer.appendChild(btn);
        });
        
    } else if (q.type === 'fitb') {
        typeBadge.textContent = 'Điền vào chỗ trống';
        typeBadge.style.borderColor = 'rgba(59, 130, 246, 0.2)';
        typeBadge.style.color = '#60a5fa';
        
        const inputContainer = document.getElementById('input-container');
        inputContainer.classList.remove('hidden');
        
        const inputField = document.getElementById('blank-input');
        inputField.value = '';
        inputField.disabled = false;
        inputField.focus();
        
        const submitBtn = document.getElementById('btn-submit-blank');
        submitBtn.disabled = false;
        
    } else if (q.type === 'order') {
        typeBadge.textContent = 'Sắp xếp trật tự câu';
        typeBadge.style.borderColor = 'rgba(168, 85, 247, 0.2)';
        typeBadge.style.color = '#c084fc';
        
        const orderContainer = document.getElementById('word-order-container');
        orderContainer.classList.remove('hidden');
        
        selectedWords = [];
        renderWordOrderZones(q.words);
    }
}

// Generate embedded SVG graphics to make quiz visually stunning
function generateSVGIllustration(theme) {
    switch (theme) {
        case 'student':
            return `
                <svg class="question-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="rgba(99,102,241,0.15)"/>
                    <path d="M50 25L25 38L50 51L75 38L50 25Z" fill="url(#stud-grad)" stroke="#6366f1" stroke-width="2"/>
                    <path d="M32 45V60C32 65 40 70 50 70C60 70 68 65 68 60V45" fill="none" stroke="#6366f1" stroke-width="2"/>
                    <path d="M70 38V55 M70 55 C70 57, 72 58, 74 55 M74 55V38" fill="none" stroke="#a855f7" stroke-width="2"/>
                    <defs>
                        <linearGradient id="stud-grad" x1="25" y1="25" x2="75" y2="51" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#6366F1"/><stop offset="1" stop-color="#A855F7"/>
                        </linearGradient>
                    </defs>
                </svg>
            `;
        case 'train':
            return `
                <svg class="question-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="rgba(245,158,11,0.15)"/>
                    <rect x="25" y="40" width="50" height="25" rx="5" fill="#f59e0b" fill-opacity="0.8"/>
                    <rect x="30" y="45" width="10" height="8" rx="2" fill="white"/>
                    <rect x="45" y="45" width="10" height="8" rx="2" fill="white"/>
                    <rect x="60" y="45" width="10" height="8" rx="2" fill="white"/>
                    <circle cx="35" cy="70" r="6" fill="#4b5563"/>
                    <circle cx="65" cy="70" r="6" fill="#4b5563"/>
                    <path d="M20 72H80" stroke="#9ca3af" stroke-width="3"/>
                </svg>
            `;
        case 'bus':
            return `
                <svg class="question-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="rgba(59,130,246,0.15)"/>
                    <rect x="20" y="35" width="60" height="30" rx="6" fill="#3b82f6"/>
                    <rect x="25" y="40" width="12" height="10" rx="1" fill="#9bf"/>
                    <rect x="42" y="40" width="12" height="10" rx="1" fill="#9bf"/>
                    <rect x="59" y="40" width="16" height="10" rx="1" fill="#9bf"/>
                    <circle cx="32" cy="70" r="7" fill="#1f2937"/>
                    <circle cx="68" cy="70" r="7" fill="#1f2937"/>
                </svg>
            `;
        case 'water':
            return `
                <svg class="question-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="rgba(16,185,129,0.15)"/>
                    <path d="M50 20C50 20, 68 38, 68 55C68 65, 60 73, 50 73C40 73, 32 65, 32 55C32 38, 50 20, 50 20Z" fill="url(#wat-grad)" stroke="#10b981" stroke-width="2"/>
                    <defs>
                        <linearGradient id="wat-grad" x1="32" y1="20" x2="68" y2="73" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#10B981"/><stop offset="1" stop-color="#3B82F6"/>
                        </linearGradient>
                    </defs>
                </svg>
            `;
        case 'ear':
            return `
                <svg class="question-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="rgba(168,85,247,0.15)"/>
                    <path d="M45 25C40 25, 30 35, 30 50C30 65, 45 75, 55 75C65 75, 70 70, 70 60C70 50, 65 45, 55 45C45 45, 40 48, 40 48" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
                    <path d="M45 48C45 48, 52 52, 55 58" stroke="#a855f7" stroke-width="2"/>
                    <path d="M60 50H80" stroke="#a855f7" stroke-width="2" stroke-dasharray="3,3"/>
                </svg>
            `;
        case 'clock':
            return `
                <svg class="question-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="rgba(99,102,241,0.1)"/>
                    <circle cx="50" cy="50" r="35" stroke="#6366f1" stroke-width="4"/>
                    <path d="M50 22V50 L68 50" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="50" cy="50" r="3" fill="#6366f1"/>
                </svg>
            `;
        default:
            return '';
    }
}

// MCQ Checker
function checkMCQAnswer(selectedBtn, selectedVal, correctVal) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });

    const isCorrect = (selectedVal === correctVal);
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        selectedBtn.querySelector('.opt-icon').innerHTML = '✅';
        handleAnswerResult(true, selectedVal, correctVal);
    } else {
        selectedBtn.classList.add('incorrect');
        selectedBtn.querySelector('.opt-icon').innerHTML = '❌';
        
        // Highlight correct
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.innerText.trim().startsWith(correctVal)) {
                btn.classList.add('correct');
                btn.querySelector('.opt-icon').innerHTML = '✅';
            }
        });
        handleAnswerResult(false, selectedVal, correctVal);
    }
}

// Fill in the Blank Checker
function checkBlankAnswer() {
    const inputField = document.getElementById('blank-input');
    const submitBtn = document.getElementById('btn-submit-blank');
    const userVal = inputField.value.trim().toLowerCase();
    
    if (!userVal) return;

    inputField.disabled = true;
    submitBtn.disabled = true;

    const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
    const q = topicQuestions[currentQuestionIndex];
    const isCorrect = q.correct.some(ans => ans.toLowerCase() === userVal);
    const correctVal = q.correct[0];
    
    handleAnswerResult(isCorrect, inputField.value.trim(), correctVal);
}

// Word Order dragging & rendering
function renderWordOrderZones(initialWords) {
    const selectedZone = document.getElementById('selected-words-zone');
    const shuffledZone = document.getElementById('shuffled-words-zone');
    
    selectedZone.innerHTML = '';
    shuffledZone.innerHTML = '';
    
    const shuffled = [...initialWords].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(word => {
        const tile = document.createElement('div');
        tile.className = 'word-tile';
        tile.textContent = word;
        tile.onclick = () => selectWordTile(word, tile);
        shuffledZone.appendChild(tile);
    });
}

function selectWordTile(word, tileElement) {
    selectedWords.push(word);
    
    const selectedZone = document.getElementById('selected-words-zone');
    const selectedTile = document.createElement('div');
    selectedTile.className = 'word-tile';
    selectedTile.textContent = word;
    selectedTile.onclick = () => deselectWordTile(word, selectedTile);
    selectedZone.appendChild(selectedTile);
    
    tileElement.remove();
}

function deselectWordTile(word, tileElement) {
    const index = selectedWords.indexOf(word);
    if (index > -1) {
        selectedWords.splice(index, 1);
    }
    
    tileElement.remove();
    
    const shuffledZone = document.getElementById('shuffled-words-zone');
    const tile = document.createElement('div');
    tile.className = 'word-tile';
    tile.textContent = word;
    tile.onclick = () => selectWordTile(word, tile);
    shuffledZone.appendChild(tile);
}

function resetWordOrder() {
    const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
    const q = topicQuestions[currentQuestionIndex];
    selectedWords = [];
    renderWordOrderZones(q.words);
}

function checkWordOrderAnswer() {
    const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
    const q = topicQuestions[currentQuestionIndex];
    const userSentence = selectedWords.join(' ').replace(/\s+\?/g, ' ?');
    const correctSentence = q.correct;
    
    const isCorrect = (userSentence.trim().toLowerCase() === correctSentence.trim().toLowerCase());
    
    document.querySelectorAll('.selected-words-zone .word-tile, .shuffled-words-zone .word-tile').forEach(tile => {
        tile.onclick = null;
        tile.style.cursor = 'default';
    });
    
    handleAnswerResult(isCorrect, userSentence, correctSentence);
}

// Sound Sorting Game Launcher
function loadSoundGameQuestion() {
    const typeBadge = document.getElementById('quiz-type-badge');
    typeBadge.textContent = 'Trò chơi phản xạ phát âm';
    typeBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
    typeBadge.style.color = '#34d399';

    // Reset question-text so old quiz text doesn't bleed through
    document.getElementById('question-text').textContent = '';

    // Pick next word avoiding immediate repeat — cycle through all words before repeating
    if (usedGameWordIndices.length >= soundGameWords.length) {
        usedGameWordIndices = []; // all words shown → reset pool
    }
    let available = soundGameWords
        .map((_, i) => i)
        .filter(i => !usedGameWordIndices.includes(i));
    const pickedIndex = available[Math.floor(Math.random() * available.length)];
    usedGameWordIndices.push(pickedIndex);
    currentGameWord = soundGameWords[pickedIndex];
    
    document.getElementById('game-target-word').textContent = currentGameWord.word;
    document.getElementById('sound-game-container').classList.remove('hidden');
    document.getElementById('game-feedback').classList.add('hidden');
    
    // Enable game buttons
    document.querySelectorAll('.bucket-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
    });
}

function checkSoundGameAnswer(userChoice) {
    // Disable game buttons
    document.querySelectorAll('.bucket-btn').forEach(btn => {
        btn.disabled = true;
    });

    const isCorrect = (userChoice === currentGameWord.correct);
    const correctRepresentation = currentGameWord.correct === 's' ? '/s/' : currentGameWord.correct === 'z' ? '/z/' : '/ɪz/';
    
    // Sound playback to reinforce
    speakText(currentGameWord.word);

    answeredQuestionsCount++;
    
    const feedbackBox = document.getElementById('feedback-box');
    const fbStatus = document.getElementById('feedback-status');
    const fbMessage = document.getElementById('feedback-message');
    const fbExplanation = document.getElementById('feedback-explanation');
    
    feedbackBox.classList.remove('hidden');
    feedbackBox.className = 'feedback-box'; // reset

    // Record detail
    userAnswers.push({
        question: `Phát âm đuôi từ: "${currentGameWord.word}"`,
        userAns: `/${userChoice}/`,
        correctAns: correctRepresentation,
        isCorrect: isCorrect,
        explanation: currentGameWord.explanation
    });

    if (isCorrect) {
        correctAnswersCount++;
        correctIpaAnswersCount++; // tracks pronunciation pro badge
        currentScore += 15; // Higher score reward for game
        streak++;
        
        feedbackBox.classList.add('correct');
        fbStatus.textContent = 'Chính xác! ⚡';
        fbMessage.textContent = 'Phản xạ tuyệt vời!';
        triggerConfettiEffect();
    } else {
        streak = 0;
        feedbackBox.classList.add('incorrect');
        fbStatus.textContent = 'Chưa chính xác 😢';
        fbMessage.innerHTML = `Đọc đúng là: <strong style="font-size: 1.15rem; color: white;">${correctRepresentation}</strong>`;
    }

    fbExplanation.textContent = currentGameWord.explanation;

    saveProgressToStorage();
    updateProgressUI();
}

// Global Answer Result & Gamified feedback
function handleAnswerResult(isCorrect, userVal, correctVal) {
    answeredQuestionsCount++;
    
    const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
    const q = topicQuestions[currentQuestionIndex];
    const feedbackBox = document.getElementById('feedback-box');
    const fbStatus = document.getElementById('feedback-status');
    const fbMessage = document.getElementById('feedback-message');
    const fbExplanation = document.getElementById('feedback-explanation');
    
    feedbackBox.classList.remove('hidden');
    feedbackBox.className = 'feedback-box';

    // Record progress
    userAnswers.push({
        question: q.question.includes('_______') ? q.question : q.question + ` (${q.correct})`,
        userAns: userVal || '(trống)',
        correctAns: correctVal,
        isCorrect: isCorrect,
        explanation: q.explanation
    });

    if (isCorrect) {
        correctAnswersCount++;
        if (currentPracticeTopic === 'ipa') correctIpaAnswersCount++;
        if (currentPracticeTopic && currentPracticeTopic.startsWith('lesson')) {
            currentLessonCorrectAnswers++;
        } else {
            currentScore += 10;
        }
        streak++;
        
        feedbackBox.classList.add('correct');
        fbStatus.textContent = 'Chính Xác! 🎉';
        
        const encouragements = ['Quá chuẩn!', 'Rất thông minh!', 'Xuất sắc!', 'Làm tốt lắm!'];
        fbMessage.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];
        
        speakText(correctVal);
        triggerConfettiEffect();
    } else {
        streak = 0;
        feedbackBox.classList.add('incorrect');
        fbStatus.textContent = 'Chưa Đúng 😢';
        fbMessage.innerHTML = `Đáp án đúng là: <strong>${correctVal}</strong>`;
    }
    
    fbExplanation.textContent = q.explanation;
    
    saveProgressToStorage();
    updateProgressUI();
}

// Next question switcher — supports infinite mode (no repeat within a full round)
function nextQuestion() {
    if (currentPracticeTopic === 'game') {
        loadSoundGameQuestion();
        return;
    }

    const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
    if (topicQuestions.length === 0) return;

    if (currentPracticeTopic && currentPracticeTopic.startsWith('lesson')) {
        currentQuestionIndex++;
        if (currentQuestionIndex >= topicQuestions.length) {
            completeLesson();
            return;
        }
        loadQuestion();
        return;
    }

    // Advance pool position
    poolPosition++;

    if (poolPosition >= shuffledQuestionPool.length) {
        // Completed one full round — reshuffle and start again (infinite!)
        shuffledQuestionPool = shuffleArray(topicQuestions.map((_, i) => i));
        poolPosition = 0;
        showRoundCompleteToast();
    }

    currentQuestionIndex = shuffledQuestionPool[poolPosition];
    loadQuestion();
}

// Utility: Fisher-Yates shuffle returning array of indices
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Brief non-blocking toast for round complete
function showRoundCompleteToast() {
    const toast = document.createElement('div');
    toast.textContent = '🎊 Vòng mới! Bài tập đã được xáo trộn ngẫu nhiên — tiếp tục chinh phục!';
    toast.style.cssText = `
        position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white; padding: 0.9rem 1.8rem; border-radius: 2rem;
        font-weight: 600; font-size: 0.95rem; z-index: 9999;
        box-shadow: 0 8px 32px rgba(99,102,241,0.4);
        animation: toastIn 0.4s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Restart Quiz
function resetQuiz() {
    answeredQuestionsCount = 0;
    correctAnswersCount = 0;
    correctIpaAnswersCount = 0;
    streak = 0;
    userAnswers = [];
    usedGameWordIndices = [];

    if (currentPracticeTopic && currentPracticeTopic.startsWith('lesson')) {
        currentQuestionIndex = 0;
        currentLessonCorrectAnswers = 0;
        const nextBtn = document.getElementById('btn-next-question');
        if (nextBtn) {
            nextBtn.textContent = 'Tiếp tục ➔';
            nextBtn.onclick = () => nextQuestion();
        }
    } else if (currentPracticeTopic !== 'game') {
        const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
        shuffledQuestionPool = shuffleArray(topicQuestions.map((_, i) => i));
        poolPosition = 0;
        currentQuestionIndex = shuffledQuestionPool[0] ?? 0;
    }
    
    saveProgressToStorage();
    loadQuestion();
    updateProgressUI();
}


// UI score refresh
function updateProgressUI() {
    if (currentPracticeTopic && currentPracticeTopic.startsWith('lesson')) {
        const csEl = document.getElementById('current-score');
        const acEl = document.getElementById('answered-count');
        if (csEl) csEl.textContent = currentLessonCorrectAnswers;
        if (acEl) acEl.textContent = currentQuestionIndex;
        
        const progressFill = document.getElementById('practice-progress');
        if (progressFill) {
            progressFill.style.width = `${(currentQuestionIndex / 10) * 100}%`;
        }
    } else {
        const csEl = document.getElementById('current-score');
        if (csEl) csEl.textContent = currentScore;
        
        const arEl = document.getElementById('answered-ratio');
        if (arEl) arEl.textContent = `${correctAnswersCount}/${answeredQuestionsCount}`;
        
        const progressFill = document.getElementById('practice-progress');
        if (progressFill) {
            if (currentPracticeTopic === 'game') {
                progressFill.style.width = '100%';
            } else {
                const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
                const percent = topicQuestions.length > 0 ? (currentQuestionIndex / topicQuestions.length) * 100 : 0;
                progressFill.style.width = `${percent}%`;
            }
        }
    }
}

// Progress Tab charts rendering & Badges
function updateProgressTab() {
    document.getElementById('stat-completed').textContent = answeredQuestionsCount;
    document.getElementById('stat-correct').textContent = correctAnswersCount;
    
    const accuracy = answeredQuestionsCount > 0 ? Math.round((correctAnswersCount / answeredQuestionsCount) * 100) : 0;
    document.getElementById('stat-accuracy').textContent = `${accuracy}%`;

    // Process badges
    updateBadges(accuracy);

    // Error reviews rendering
    const reviewList = document.getElementById('review-list');
    const incorrectAnswers = userAnswers.filter(ans => !ans.isCorrect);

    if (incorrectAnswers.length === 0) {
        reviewList.innerHTML = '<div class="empty-state">Tuyệt vời! Bạn chưa trả lời sai câu nào. Hãy tiếp tục phát huy!</div>';
    } else {
        reviewList.innerHTML = '';
        incorrectAnswers.forEach(item => {
            const row = document.createElement('div');
            row.className = 'review-item';
            row.innerHTML = `
                <div>
                    <div class="review-q-text">${item.question}</div>
                    <div class="review-details">
                        Bạn đã chọn: <span class="text-error" style="text-decoration: line-through;">${item.userAns}</span> | 
                        Đáp án đúng: <span class="text-success" style="font-weight: 600;">${item.correctAns}</span>
                    </div>
                    <div class="review-details" style="font-style: italic; margin-top: 4px; color: var(--text-muted);">
                        💡 ${item.explanation}
                    </div>
                </div>
                <button class="btn-tts" onclick="speakText('${item.correctAns.replace(/'/g, "\\'")}')" title="Nghe phát âm">🔊</button>
            `;
            reviewList.appendChild(row);
        });
    }

    // Refresh saved vocabulary notebook UI
    renderVocabularyNotebook();
}

function updateBadges(accuracy) {
    const starterBadge = document.getElementById('badge-starter');
    const scholarBadge = document.getElementById('badge-scholar');
    const pronBadge = document.getElementById('badge-pronunciation');
    const masterBadge = document.getElementById('badge-master');

    if (correctAnswersCount >= 1) {
        starterBadge.classList.remove('locked');
        starterBadge.classList.add('unlocked');
    } else {
        starterBadge.classList.add('locked');
    }

    if (correctAnswersCount >= 5) {
        scholarBadge.classList.remove('locked');
        scholarBadge.classList.add('unlocked');
    } else {
        scholarBadge.classList.add('locked');
    }

    // Pronunciation Pro Badge: 5 correct answers in IPA topics
    if (correctIpaAnswersCount >= 5) {
        pronBadge.classList.remove('locked');
        pronBadge.classList.add('unlocked');
    } else {
        pronBadge.classList.add('locked');
    }

    if (answeredQuestionsCount >= 10 && accuracy === 100) {
        masterBadge.classList.remove('locked');
        masterBadge.classList.add('unlocked');
    } else {
        masterBadge.classList.add('locked');
    }
}

// Confetti Gamification Animation
function triggerConfettiEffect() {
    const container = document.body;
    for (let i = 0; i < 35; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-particle';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = ['#6366F1', '#A855F7', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.transform = `scale(${Math.random() * 0.7 + 0.5})`;
        container.appendChild(confetti);
        
        // Remove after animation completes
        setTimeout(() => confetti.remove(), 2500);
    }
}

// FLOATING TRANSLATOR & DICTIONARY LOGIC
function toggleTranslatorPanel() {
    const panel = document.getElementById('translator-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        document.getElementById('translator-input').focus();
    }
}

async function handleTranslateAction() {
    const inputField = document.getElementById('translator-input');
    const query = inputField.value.trim();
    if (!query) return;

    const translateBtn = document.getElementById('btn-action-translate');
    translateBtn.textContent = 'Đang tra cứu...';
    translateBtn.disabled = true;

    try {
        const words = query.split(/\s+/);
        const isSingleWord = words.length === 1 && /^[a-zA-Z'-]+$/.test(words[0]);

        // 1. Fetch Vietnamese Translation from MyMemory Translation API
        const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|vi`;
        const resTrans = await fetch(translationUrl);
        const dataTrans = await resTrans.json();
        let translatedText = dataTrans.responseData.translatedText || "Không tìm thấy nghĩa.";

        // Fix HTML entity decoding from API
        const parser = new DOMParser();
        const decodedTransText = parser.parseFromString(translatedText, 'text/html').body.textContent;

        document.getElementById('result-translated-text').textContent = decodedTransText;
        document.getElementById('result-translated-text').className = 'result-translated-text';

        // 2. Fetch dictionary phonetics if single word
        if (isSingleWord) {
            const cleanWord = words[0].toLowerCase();
            const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`;
            const resDict = await fetch(dictUrl);
            
            if (resDict.ok) {
                const dataDict = await resDict.json();
                activeWordData = parseDictionaryData(dataDict[0]);
                
                // Show dictionary result layout
                document.getElementById('result-word').textContent = activeWordData.word;
                document.getElementById('phonetic-uk').textContent = activeWordData.phoneticUK || '/-/';
                document.getElementById('phonetic-us').textContent = activeWordData.phoneticUS || '/-/';
                
                // Toggle sound buttons visibility
                document.getElementById('btn-play-uk').style.display = activeWordData.audioUK ? 'inline-block' : 'none';
                document.getElementById('btn-play-us').style.display = activeWordData.audioUS ? 'inline-block' : 'none';
                
                // Definitions list render
                const defsContainer = document.getElementById('definitions-list');
                defsContainer.innerHTML = '';
                activeWordData.meanings.slice(0, 3).forEach(mean => {
                    const div = document.createElement('div');
                    div.className = 'def-item';
                    div.innerHTML = `<span class="def-pos">${mean.partOfSpeech}:</span> ${mean.definition}`;
                    defsContainer.appendChild(div);
                });
                
                document.getElementById('result-word-info').classList.remove('hidden');
                document.getElementById('result-definitions-box').classList.remove('hidden');
            } else {
                // Not found in academic dictionary, fall back to pure text translation
                setupFallbackTranslation(cleanWord);
            }
        } else {
            // It's a sentence translation
            setupFallbackTranslation(query);
        }

        // Show result box
        document.getElementById('translator-result-area').classList.remove('hidden');

    } catch (err) {
        console.error('Lỗi khi tra dịch từ:', err);
        document.getElementById('result-translated-text').textContent = 'Lỗi kết nối máy chủ dịch thuật.';
        document.getElementById('result-translated-text').className = 'result-translated-text text-error';
    } finally {
        translateBtn.textContent = 'Tra cứu / Dịch ➔';
        translateBtn.disabled = false;
    }
}

function setupFallbackTranslation(query) {
    document.getElementById('result-word').textContent = query.length > 20 ? query.substring(0, 18) + '...' : query;
    document.getElementById('result-word-info').classList.remove('hidden');
    document.getElementById('result-definitions-box').classList.add('hidden');
    
    // Map to bare strings for SpeechSynthesis
    activeWordData = {
        word: query,
        phoneticUK: '🇬🇧 Phát âm UK',
        phoneticUS: '🇺🇸 Phát âm US',
        audioUK: null,
        audioUS: null,
        meanings: []
    };
    
    document.getElementById('phonetic-uk').textContent = 'Web Speech UK Acc';
    document.getElementById('phonetic-us').textContent = 'Web Speech US Acc';
    document.getElementById('btn-play-uk').style.display = 'inline-block';
    document.getElementById('btn-play-us').style.display = 'inline-block';
}

function parseDictionaryData(data) {
    const word = data.word;
    let phoneticUK = '';
    let phoneticUS = '';
    let audioUK = null;
    let audioUS = null;

    // Extract IPA phonetics
    if (data.phonetics && data.phonetics.length > 0) {
        data.phonetics.forEach(p => {
            if (p.audio) {
                if (p.audio.includes('-uk.mp3') || p.audio.includes('/uk/')) {
                    audioUK = p.audio;
                    if (p.text) phoneticUK = p.text;
                } else if (p.audio.includes('-us.mp3') || p.audio.includes('/us/')) {
                    audioUS = p.audio;
                    if (p.text) phoneticUS = p.text;
                } else {
                    if (!audioUS) audioUS = p.audio;
                    if (!audioUK) audioUK = p.audio;
                }
            }
            if (p.text && !phoneticUK && !phoneticUS) {
                phoneticUK = p.text;
                phoneticUS = p.text;
            }
        });
    }

    if (!phoneticUK) phoneticUK = data.phonetic || '';
    if (!phoneticUS) phoneticUS = data.phonetic || '';

    // Extract Definitions
    const meanings = [];
    if (data.meanings) {
        data.meanings.forEach(m => {
            if (m.definitions && m.definitions.length > 0) {
                meanings.push({
                    partOfSpeech: m.partOfSpeech,
                    definition: m.definitions[0].definition
                });
            }
        });
    }

    return { word, phoneticUK, phoneticUS, audioUK, audioUS, meanings };
}

// Audio player for Dictionary MP3 files, falls back to TTS
function playWordAudio(accent) {
    if (!activeWordData) return;

    const audioUrl = (accent === 'uk') ? activeWordData.audioUK : activeWordData.audioUS;
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => {
            console.warn('Lỗi tự động phát audio MP3, chuyển sang TTS:', e);
            speakText(activeWordData.word, accent);
        });
    } else {
        // No audio URL, speak using Synthesis
        speakText(activeWordData.word, accent);
    }
}

// Translate by clicking on words directly in the lesson
async function translateWordClick(word) {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    if (!cleanWord || cleanWord.length < 2) return;

    // Put query in translator input & toggle panel
    document.getElementById('translator-input').value = cleanWord;
    const panel = document.getElementById('translator-panel');
    panel.classList.remove('hidden');
    
    handleTranslateAction();
}

// CLICK-TO-TRANSLATE ONE-CLICK BUBBLE SETUP
function setupClickToTranslate() {
    // Select elements that should support word clicking
    const targetAreas = document.querySelectorAll('.main-content');
    
    targetAreas.forEach(area => {
        area.addEventListener('dblclick', async (e) => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            
            // Only translate single words
            if (!text || text.includes(' ') || text.length < 2 || !/^[a-zA-Z'-]+$/.test(text)) {
                return;
            }

            e.preventDefault();
            
            // Get screen coordinates of the selection
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            const bubble = document.getElementById('translate-bubble');
            bubble.classList.remove('hidden');
            
            // Position the bubble right above the selected word
            const topOffset = window.scrollY + rect.top - bubble.offsetHeight - 10;
            const leftOffset = window.scrollX + rect.left + (rect.width / 2) - (bubble.offsetWidth / 2);
            
            bubble.style.top = `${Math.max(topOffset, 10)}px`;
            bubble.style.left = `${Math.max(leftOffset, 10)}px`;
            
            document.getElementById('bubble-word').textContent = text.toLowerCase();
            document.getElementById('bubble-translation').textContent = 'Đang tra cứu...';
            document.getElementById('bubble-ipa-uk').textContent = '/-/';
            document.getElementById('bubble-ipa-us').textContent = '/-/';

            try {
                // Call APIs for the bubble
                const transUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
                const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${text.toLowerCase()}`;
                
                // Fetch in parallel
                const [resTrans, resDict] = await Promise.all([fetch(transUrl), fetch(dictUrl)]);
                
                let vietnameseMeaning = 'Không tìm thấy nghĩa.';
                if (resTrans.ok) {
                    const transData = await resTrans.json();
                    vietnameseMeaning = transData.responseData.translatedText;
                    
                    const parser = new DOMParser();
                    vietnameseMeaning = parser.parseFromString(vietnameseMeaning, 'text/html').body.textContent;
                }
                
                let ipaUK = '/-/';
                let ipaUS = '/-/';
                let audioUK = null;
                let audioUS = null;
                
                if (resDict.ok) {
                    const dictData = await resDict.json();
                    const parsed = parseDictionaryData(dictData[0]);
                    ipaUK = parsed.phoneticUK || '/-/';
                    ipaUS = parsed.phoneticUS || '/-/';
                    audioUK = parsed.audioUK;
                    audioUS = parsed.audioUS;
                }
                
                // Set bubble state data
                bubble.dataset.word = text.toLowerCase();
                bubble.dataset.translation = vietnameseMeaning;
                bubble.dataset.ipaUk = ipaUK;
                bubble.dataset.ipaUs = ipaUS;
                bubble.dataset.audioUk = audioUK || '';
                bubble.dataset.audioUs = audioUS || '';

                document.getElementById('bubble-translation').textContent = vietnameseMeaning;
                document.getElementById('bubble-ipa-uk').textContent = ipaUK;
                document.getElementById('bubble-ipa-us').textContent = ipaUS;
                
                // Add class to star icon if already saved
                const saveBtn = document.getElementById('bubble-save-btn');
                const isAlreadySaved = savedVocabList.some(v => v.word.toLowerCase() === text.toLowerCase());
                if (isAlreadySaved) {
                    saveBtn.classList.add('saved');
                } else {
                    saveBtn.classList.remove('saved');
                }

            } catch (err) {
                console.error(err);
                document.getElementById('bubble-translation').textContent = 'Lỗi kết nối.';
            }
        });
    });
}

function closeTranslateBubble() {
    const bubble = document.getElementById('translate-bubble');
    if (bubble) bubble.classList.add('hidden');
}

function playBubbleAudio(accent) {
    const bubble = document.getElementById('translate-bubble');
    const word = bubble.dataset.word;
    const audioUrl = (accent === 'uk') ? bubble.dataset.audioUk : bubble.dataset.audioUs;
    
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => speakText(word, accent));
    } else {
        speakText(word, accent);
    }
}

// VOCABULARY NOTEBOOK CRUD SAVES
function saveActiveWordToVocab() {
    if (!activeWordData) return;
    
    const word = activeWordData.word;
    const translation = document.getElementById('result-translated-text').textContent;
    const ipa = (activeWordData.phoneticUK && activeWordData.phoneticUK !== '/-/') ? activeWordData.phoneticUK : activeWordData.phoneticUS || '/-/';
    const audioUk = activeWordData.audioUK || '';
    const audioUs = activeWordData.audioUS || '';
    
    addWordToVocabNotebook(word, translation, ipa, audioUk, audioUs);
    
    // Star icon state toggle
    const starBtn = document.getElementById('btn-save-vocab');
    if (starBtn) {
        starBtn.classList.add('saved');
    }
}

function saveBubbleWordToVocab() {
    const bubble = document.getElementById('translate-bubble');
    const word = bubble.dataset.word;
    const translation = bubble.dataset.translation;
    const ipa = bubble.dataset.ipaUk !== '/-/' ? bubble.dataset.ipaUk : bubble.dataset.ipaUs;
    const audioUk = bubble.dataset.audioUk;
    const audioUs = bubble.dataset.audioUs;
    
    addWordToVocabNotebook(word, translation, ipa, audioUk, audioUs);
    
    const starBtn = document.getElementById('bubble-save-btn');
    if (starBtn) {
        starBtn.classList.add('saved');
    }
}

function addWordToVocabNotebook(word, translation, ipa, audioUk, audioUs) {
    // Check duplication
    const duplicate = savedVocabList.some(item => item.word.toLowerCase() === word.toLowerCase());
    if (duplicate) {
        alert(`Từ "${word}" đã được lưu trong sổ tay từ vựng.`);
        return;
    }

    savedVocabList.push({ word, translation, ipa, audioUk, audioUs });
    saveProgressToStorage();
    alert(`Đã lưu thành công "${word}" vào sổ tay từ vựng cá nhân! ⭐`);
}

function renderVocabularyNotebook() {
    const container = document.getElementById('vocab-notebook-list');
    if (!container) return;

    if (savedVocabList.length === 0) {
        container.innerHTML = '<div class="empty-state">Chưa lưu từ vựng nào. Hãy gõ tra từ hoặc nhấp trực tiếp vào từ có sẵn trong bài học để thêm vào sổ tay!</div>';
        return;
    }

    container.innerHTML = '';
    savedVocabList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'vocab-item';
        card.innerHTML = `
            <div class="vocab-word-info">
                <span class="vocab-word">${item.word}</span>
                <span class="vocab-ipa">${item.ipa}</span>
                <span class="vocab-translation">${item.translation}</span>
            </div>
            <div class="vocab-actions">
                <button class="btn-tts" onclick="playSavedVocabAudio('${item.word}', '${item.audioUs}', 'us')" title="Phát âm giọng US">🇺🇸</button>
                <button class="btn-tts" onclick="playSavedVocabAudio('${item.word}', '${item.audioUk}', 'uk')" title="Phát âm giọng UK">🇬🇧</button>
                <button class="btn-delete-vocab" onclick="deleteVocabWord(${index})" title="Xóa khỏi sổ tay">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function playSavedVocabAudio(word, url, accent) {
    if (url && url !== 'undefined' && url !== '') {
        const audio = new Audio(url);
        audio.play().catch(() => speakText(word, accent));
    } else {
        speakText(word, accent);
    }
}

function deleteVocabWord(index) {
    savedVocabList.splice(index, 1);
    saveProgressToStorage();
    renderVocabularyNotebook();
}

function clearVocabularyNotebook() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ từ vựng đã lưu không?')) {
        savedVocabList = [];
        saveProgressToStorage();
        renderVocabularyNotebook();
    }
}

// Local Storage Persistence
function saveProgressToStorage() {
    const data = {
        currentScore,
        answeredQuestionsCount,
        correctAnswersCount,
        correctIpaAnswersCount,
        streak,
        currentQuestionIndex,
        userAnswers,
        savedVocabList,
        lessonScores
    };
    localStorage.setItem('english_present_simple_progress', JSON.stringify(data));
}

function loadProgressFromStorage() {
    const stored = localStorage.getItem('english_present_simple_progress');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            currentScore = data.currentScore || 0;
            answeredQuestionsCount = data.answeredQuestionsCount || 0;
            correctAnswersCount = data.correctAnswersCount || 0;
            correctIpaAnswersCount = data.correctIpaAnswersCount || 0;
            streak = data.streak || 0;
            currentQuestionIndex = data.currentQuestionIndex || 0;
            userAnswers = data.userAnswers || [];
            savedVocabList = data.savedVocabList || [];
            lessonScores = data.lessonScores || {};
        } catch (e) {
            console.error('Lỗi khi nạp dữ liệu tiến trình học tập:', e);
        }
    }
}

// Call on startup loading
loadProgressFromStorage();

// ======================================================
//   DICTIONARY TAB - TỪ ĐIỂN & PHÁT ÂM CHÍNH
// ======================================================

let activeDictWordData = null;

async function handleDictSearch() {
    const input = document.getElementById('dict-main-input');
    const query = input ? input.value.trim() : '';
    if (!query) return;

    const loadingEl = document.getElementById('dict-loading');
    const resultWrapper = document.getElementById('dict-result-wrapper');
    const sentenceResult = document.getElementById('dict-sentence-result');

    loadingEl.classList.remove('hidden');
    resultWrapper.classList.add('hidden');
    sentenceResult.classList.add('hidden');

    // Reset the IPA detail panel
    document.getElementById('dict-panel-empty').classList.remove('hidden');
    document.getElementById('dict-panel-content').classList.add('hidden');

    const words = query.split(/\s+/);
    const isSingleWord = words.length === 1 && /^[a-zA-Z'-]+$/.test(words[0]);

    try {
        if (isSingleWord) {
            const cleanWord = words[0].toLowerCase();
            const [resTrans, resDict] = await Promise.all([
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|vi`),
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`)
            ]);

            let viMeaning = '';
            if (resTrans.ok) {
                const td = await resTrans.json();
                const raw = td.responseData.translatedText || '';
                viMeaning = new DOMParser().parseFromString(raw, 'text/html').body.textContent;
            }

            if (resDict.ok) {
                const dictData = await resDict.json();
                activeDictWordData = parseDictionaryData(dictData[0]);
                activeDictWordData.viMeaning = viMeaning;
                renderDictWordResult(activeDictWordData, dictData[0]);
            } else {
                renderDictFallback(cleanWord, viMeaning);
            }
        } else {
            // Translate using MyMemory AND check grammar using LanguageTool API in parallel!
            let viSentence = 'Không tìm thấy bản dịch.';
            let grammarMatches = [];
            let isLocalTrans = false;

            const cleanQuery = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim().replace(/\s+/g, " ");
            const localTrans = getLocalTranslation(cleanQuery);

            if (localTrans) {
                viSentence = localTrans;
                isLocalTrans = true;

                // Still check grammar for learning suggestions!
                try {
                    const params = new URLSearchParams();
                    params.append("text", query);
                    params.append("language", "en-US");
                    params.append("enabledOnly", "false");

                    const resGrammar = await fetch("https://api.languagetool.org/v2/check", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Accept": "application/json"
                        },
                        body: params
                    });
                    if (resGrammar.ok) {
                        const dataGrammar = await resGrammar.json();
                        grammarMatches = dataGrammar.matches || [];
                    }
                } catch (e) {
                    console.warn('Lỗi kiểm tra ngữ pháp câu cục bộ:', e);
                }
            } else {
                // Call MyMemory & LanguageTool in parallel
                try {
                    // Prepare parallel API calls
                    const translatePromise = fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|vi`)
                        .then(async res => {
                            if (res.ok) {
                                const td = await res.json();
                                const raw = td.responseData.translatedText || '';
                                viSentence = new DOMParser().parseFromString(raw, 'text/html').body.textContent;
                            }
                        }).catch(e => console.warn('Lỗi dịch MyMemory:', e));

                    const params = new URLSearchParams();
                    params.append("text", query);
                    params.append("language", "en-US");
                    params.append("enabledOnly", "false");

                    const grammarPromise = fetch("https://api.languagetool.org/v2/check", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Accept": "application/json"
                        },
                        body: params
                    }).then(async res => {
                        if (res.ok) {
                            const dataGrammar = await res.json();
                            grammarMatches = dataGrammar.matches || [];
                        }
                    }).catch(e => console.warn('Lỗi kiểm tra ngữ pháp LanguageTool:', e));

                    // Wait for both to complete
                    await Promise.all([translatePromise, grammarPromise]);
                } catch (parallelErr) {
                    console.error('Error during parallel fetch:', parallelErr);
                }
            }
            
            renderDictSentence(query, viSentence, grammarMatches, isLocalTrans);
        }
    } catch (err) {
        console.error('Dict tab error:', err);
        document.getElementById('dict-translation-text').textContent = 'Lỗi kết nối. Vui lòng thử lại.';
        resultWrapper.classList.remove('hidden');
    } finally {
        loadingEl.classList.add('hidden');
    }
}

function renderDictWordResult(data, rawData) {
    document.getElementById('dict-word-main').textContent = data.word;
    const pos = data.meanings && data.meanings.length > 0 ? data.meanings[0].partOfSpeech : '';
    document.getElementById('dict-word-type').textContent = pos ? `(${pos})` : '';
    document.getElementById('dict-ipa-uk').textContent = data.phoneticUK || '/—/';
    document.getElementById('dict-ipa-us').textContent = data.phoneticUS || '/—/';
    document.getElementById('dict-translation-text').textContent = data.viMeaning || '(Chưa có nghĩa tiếng Việt)';

    // Definitions
    const defsArea = document.getElementById('dict-definitions-area');
    defsArea.innerHTML = '';
    (data.meanings || []).slice(0, 4).forEach(m => {
        const div = document.createElement('div');
        div.className = 'dict-def-item';
        div.innerHTML = `<span class="dict-def-pos">${m.partOfSpeech}:</span> ${m.definition}`;
        defsArea.appendChild(div);
    });

    // IPA Sound Breakdown chips
    renderIPABreakdown(data.phoneticUK || data.phoneticUS || '');

    document.getElementById('dict-result-wrapper').classList.remove('hidden');
    document.getElementById('dict-sentence-result').classList.add('hidden');
    document.getElementById('dict-save-btn').classList.remove('saved');

    // AUTO-PLAY UK audio after short delay
    setTimeout(() => playDictAudio('uk'), 500);
}

function renderDictFallback(word, viMeaning) {
    document.getElementById('dict-word-main').textContent = word;
    document.getElementById('dict-word-type').textContent = '';
    document.getElementById('dict-ipa-uk').textContent = '/—/';
    document.getElementById('dict-ipa-us').textContent = '/—/';
    document.getElementById('dict-translation-text').textContent = viMeaning || '(Không tìm thấy nghĩa)';
    document.getElementById('dict-definitions-area').innerHTML = '';
    document.getElementById('dict-sound-chips').innerHTML = `
        <p style="color:var(--text-muted);font-size:0.85rem;padding:1rem 0;">
            Không tìm thấy từ này trong từ điển phát âm. Bạn có thể nghe bằng nút phát âm UK/US.
        </p>`;
    activeDictWordData = { word, phoneticUK: '', phoneticUS: '', audioUK: null, audioUS: null, meanings: [], viMeaning };
    document.getElementById('dict-result-wrapper').classList.remove('hidden');
    document.getElementById('dict-sentence-result').classList.add('hidden');
    setTimeout(() => speakText(word, 'uk'), 500);
}

function renderDictSentence(sentence, viTranslation, grammarMatches = [], isLocalTrans = false) {
    document.getElementById('dict-sentence-original').textContent = sentence;
    
    const transEl = document.getElementById('dict-sentence-translation');
    if (isLocalTrans) {
        transEl.innerHTML = `<span style="font-size:0.75rem; background:rgba(56, 189, 248, 0.15); color:#38bdf8; padding:0.2rem 0.5rem; border-radius:4px; font-weight:600; margin-bottom:0.5rem; display:inline-block;">✨ Bản dịch chuẩn Easy English</span><br>${viTranslation}`;
    } else {
        transEl.textContent = viTranslation;
    }
    
    // Process grammar suggestions
    const grammarContainer = document.getElementById('dict-grammar-analysis');
    if (grammarContainer) {
        grammarContainer.innerHTML = '';
        
        if (grammarMatches && grammarMatches.length > 0) {
            // Reconstruct corrected sentence
            const correctedSentence = reconstructCorrectedSentence(sentence, grammarMatches);
            
            // Build the header and corrected block
            let html = `
                <div class="grammar-header">
                    <span>⚠️ Phát hiện ${grammarMatches.length} lỗi chính tả / ngữ pháp trong câu của bạn:</span>
                </div>
                
                <div class="grammar-corrected-box">
                    <div class="grammar-corrected-title">💡 Gợi ý câu viết lại đúng chuẩn:</div>
                    <div class="grammar-corrected-text">
                        <span id="txt-corrected-sentence">${correctedSentence}</span>
                        <div class="grammar-actions">
                            <button class="btn-search-corrected" onclick="useCorrectedSentence(\`${correctedSentence.replace(/`/g, "\\`").replace(/'/g, "\\'")}\`)" title="Tra cứu câu sửa">Tra câu này 🔍</button>
                            <button class="btn-tts-corrected" onclick="speakText(\`${correctedSentence.replace(/`/g, "\\`").replace(/'/g, "\\'")}\`, 'us')" title="Nghe câu sửa">🔊 Nghe</button>
                        </div>
                    </div>
                </div>
                <div class="grammar-errors-list">
            `;
            
            // Add details for each mistake
            grammarMatches.forEach((match, index) => {
                const wrongText = sentence.substring(match.offset, match.offset + match.length);
                const suggestedText = (match.replacements && match.replacements.length > 0) 
                    ? match.replacements.slice(0, 3).map(r => r.value).join(', ') 
                    : '(Không có gợi ý)';
                
                const translatedExplain = translateGrammarRule(match.message);
                
                html += `
                    <div class="grammar-err-item">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
                            <span>❌ Sai: <span class="grammar-err-bad">${wrongText}</span></span>
                            <span>➔ Sửa lại: <span class="grammar-err-good">${suggestedText}</span></span>
                        </div>
                        <div class="grammar-err-desc">📌 ${translatedExplain}</div>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            // Render to container
            grammarContainer.innerHTML = html;
            grammarContainer.style.display = 'block';
        } else {
            // No grammar mistakes! Display a congratulatory message
            grammarContainer.innerHTML = `
                <div class="grammar-header success" style="color: var(--success-light); display:flex; align-items:center; gap:0.5rem; margin-bottom:0; font-size: 0.9rem;">
                    <span>✅ Ngữ pháp xuất sắc! Không phát hiện lỗi chính tả hay ngữ pháp nào trong câu này.</span>
                </div>
            `;
            grammarContainer.style.display = 'block';
        }
    }

    document.getElementById('dict-sentence-result').classList.remove('hidden');
    document.getElementById('dict-result-wrapper').classList.add('hidden');
    setTimeout(() => speakText(sentence, 'us'), 500);
}

function reconstructCorrectedSentence(text, matches) {
    if (!matches || matches.length === 0) return text;
    // Sort descending by offset so that replacing from back to front doesn't shift earlier indices!
    const sortedMatches = [...matches].sort((a, b) => b.offset - a.offset);
    let corrected = text;
    sortedMatches.forEach(match => {
        if (match.replacements && match.replacements.length > 0) {
            const replacement = match.replacements[0].value;
            corrected = corrected.substring(0, match.offset) + replacement + corrected.substring(match.offset + match.length);
        }
    });
    return corrected;
}

function useCorrectedSentence(newSentence) {
    const input = document.getElementById('dict-main-input');
    if (input) {
        input.value = newSentence;
        handleDictSearch();
    }
}

function translateGrammarRule(msg) {
    if (!msg) return "";
    
    // Standard quick matches for common LanguageTool errors
    const mappings = [
        { regex: /verb does not agree with the subject/i, trans: "Động từ này không chia đúng với chủ ngữ (lỗi hòa hợp chủ vị)." },
        { regex: /use 'an' instead of 'a'/i, trans: "Dùng 'an' thay vì 'a' trước từ bắt đầu bằng nguyên âm (u, e, o, a, i)." },
        { regex: /use 'a' instead of 'an'/i, trans: "Dùng 'a' thay vì 'an' trước từ bắt đầu bằng phụ âm." },
        { regex: /possible spelling mistake/i, trans: "Có thể viết sai chính tả. Hãy kiểm tra lại cách viết của từ này." },
        { regex: /use the bare infinitive/i, trans: "Dùng động từ nguyên mẫu không 'to' ở đây." },
        { regex: /did you mean/i, trans: "Có phải ý bạn là..." },
        { regex: /should be followed by/i, trans: "Từ này nên được đi kèm bởi..." },
        { regex: /duplicate word/i, trans: "Từ này bị lặp lại hai lần liên tiếp." },
        { regex: /whitespace/i, trans: "Có khoảng trắng thừa hoặc không hợp lệ." },
        { regex: /lowercase/i, trans: "Hãy viết hoa chữ cái đầu tiên của câu hoặc tên riêng." },
        { regex: /capitalization/i, trans: "Sai quy tắc viết hoa viết thường." }
    ];

    for (let mapping of mappings) {
        if (mapping.regex.test(msg)) {
            return mapping.trans;
        }
    }

    return msg;
}

function renderIPABreakdown(ipaText) {
    const container = document.getElementById('dict-sound-chips');
    container.innerHTML = '';
    if (!ipaText || ipaText === '/—/') {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem 0;">Không có thông tin IPA để phân tích.</p>';
        return;
    }

    // Show full IPA label
    const fullLabel = document.createElement('div');
    fullLabel.className = 'ipa-full-word-label';
    fullLabel.textContent = ipaText;
    container.appendChild(fullLabel);

    // Clean IPA for matching
    const cleaned = ipaText.replace(/[\/\.ˈˌː]/g, '');
    const matchedSounds = [];
    let remaining = cleaned;
    let safety = 0;

    while (remaining.length > 0 && safety++ < 60) {
        let matched = false;
        for (let len = 3; len >= 1; len--) {
            if (remaining.length < len) continue;
            const chunk = remaining.substring(0, len);
            const found = allIpaSounds.find(s => {
                const sym = s.symbol.replace(/[\/\.ˈˌː]/g, '');
                return sym === chunk;
            });
            if (found) {
                matchedSounds.push(found);
                remaining = remaining.substring(len);
                matched = true;
                break;
            }
        }
        if (!matched) {
            matchedSounds.push({ symbol: remaining[0], _unmatched: true, type: 'other' });
            remaining = remaining.substring(1);
        }
    }

    if (matchedSounds.filter(s => !s._unmatched).length === 0) {
        container.innerHTML += '<p style="color:var(--text-muted);font-size:0.85rem;">Nhấp vào bảng IPA để tìm hiểu từng âm.</p>';
        return;
    }

    const chipsRow = document.createElement('div');
    chipsRow.className = 'ipa-chips-row';
    matchedSounds.forEach(sound => {
        const chip = document.createElement('button');
        chip.className = `dict-ipa-chip sound-type-${sound.type || 'other'}${sound._unmatched ? ' unmatched' : ''}`;
        chip.textContent = sound.symbol;
        chip.title = sound.name || '';
        if (!sound._unmatched) {
            chip.onclick = () => showDictIpaDetail(sound, chip);
        }
        chipsRow.appendChild(chip);
    });
    container.appendChild(chipsRow);

    const hint = document.createElement('p');
    hint.className = 'chips-hint';
    hint.textContent = '👆 Nhấp vào từng âm để xem hướng dẫn khẩu hình →';
    container.appendChild(hint);
}

function showDictIpaDetail(sound, chipEl) {
    document.querySelectorAll('.dict-ipa-chip').forEach(c => c.classList.remove('active'));
    if (chipEl) chipEl.classList.add('active');

    document.getElementById('dict-panel-empty').classList.add('hidden');
    document.getElementById('dict-panel-content').classList.remove('hidden');

    document.getElementById('dict-panel-type').textContent = sound.name || sound.symbol;
    document.getElementById('dict-panel-symbol').textContent = sound.symbol;
    document.getElementById('dict-panel-name').textContent = sound.voicing === 'voiced' ? 'Hữu thanh (Voiced)' : 'Vô thanh (Voiceless)';

    const isVoiced = sound.voicing === 'voiced';
    document.getElementById('dict-voice-wave').className = isVoiced ? 'voice-wave active' : 'voice-wave';
    document.getElementById('dict-voicing-text').textContent = isVoiced
        ? '🔔 Hữu thanh – Đặt tay lên cổ, cảm nhận rung khi phát âm'
        : '🔕 Vô thanh – Hơi thở thoát ra, không rung cổ họng';

    // Render mouth SVG
    const svgEl = document.getElementById('dict-mouth-svg');
    if (svgEl) {
        drawMouthSVG('dict-mouth-svg', sound.symbol);
    }

    // Instructions
    const listEl = document.getElementById('dict-instructions-list');
    listEl.innerHTML = '';
    (sound.description || []).forEach(desc => {
        const li = document.createElement('li');
        li.textContent = desc;
        listEl.appendChild(li);
    });

    // Examples
    const existingEx = document.getElementById('dict-panel-content').querySelector('.dict-panel-examples');
    if (existingEx) existingEx.remove();

    if (sound.examples && sound.examples.length > 0) {
        const exDiv = document.createElement('div');
        exDiv.className = 'dict-panel-examples';
        exDiv.innerHTML = '<h5>Từ ví dụ:</h5>';
        const exList = document.createElement('div');
        exList.className = 'example-list';
        sound.examples.forEach(ex => {
            const item = document.createElement('div');
            item.className = 'example-item';
            item.innerHTML = `
                <button class="btn-play-example" onclick="speakText('${ex.word}','uk')" title="Nghe">▶</button>
                <span class="example-word">${ex.word}</span>
                <span class="example-ipa">${ex.ipa}</span>
                <span class="example-meaning">${ex.text}</span>`;
            exList.appendChild(item);
        });
        exDiv.appendChild(exList);
        document.getElementById('dict-panel-content').appendChild(exDiv);

        // Play first example word
        speakText(sound.examples[0].word, 'uk');
    }
}

function playDictAudio(accent) {
    if (!activeDictWordData) return;
    const audioUrl = accent === 'uk' ? activeDictWordData.audioUK : activeDictWordData.audioUS;
    const fallbackAccent = accent === 'uk' ? 'us' : 'uk';
    const fallbackUrl = accent === 'uk' ? activeDictWordData.audioUS : activeDictWordData.audioUK;

    const playUrl = audioUrl || fallbackUrl;
    if (playUrl) {
        const audio = new Audio(playUrl);
        audio.play().catch(() => speakText(activeDictWordData.word, accent));
    } else {
        speakText(activeDictWordData.word, accent);
    }
}

function playSentenceAudio(elementId, accent) {
    const el = document.getElementById(elementId);
    if (el) speakText(el.textContent, accent);
}

function clearDictSearch() {
    const input = document.getElementById('dict-main-input');
    if (input) { input.value = ''; input.focus(); }
    document.getElementById('dict-result-wrapper').classList.add('hidden');
    document.getElementById('dict-sentence-result').classList.add('hidden');
    document.getElementById('dict-loading').classList.add('hidden');
    document.getElementById('dict-panel-empty').classList.remove('hidden');
    document.getElementById('dict-panel-content').classList.add('hidden');
    activeDictWordData = null;
}

function quickSearch(word) {
    const input = document.getElementById('dict-main-input');
    if (input) input.value = word;
    handleDictSearch();
}

function saveDictWordToVocab() {
    if (!activeDictWordData) return;
    const { word, phoneticUK, phoneticUS, audioUK, audioUS, viMeaning } = activeDictWordData;
    const ipa = phoneticUK || phoneticUS || '';
    addWordToVocabNotebook(word, viMeaning || '', ipa, audioUK || '', audioUS || '');
    const btn = document.getElementById('dict-save-btn');
    if (btn) btn.classList.add('saved');
}

// Override translateWordClick to redirect to dict tab
function translateWordClick(word) {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    if (!cleanWord || cleanWord.length < 2) return;
    switchTab('dict');
    const input = document.getElementById('dict-main-input');
    if (input) input.value = cleanWord;
    setTimeout(() => handleDictSearch(), 350);
}

function getLocalTranslation(cleanQuery) {
    const commonTranslations = {
        "i am going to school": "Tôi đang đi học / Tôi đang đi đến trường.",
        "im going to school": "Tôi đang đi học / Tôi đang đi đến trường.",
        "i go to school": "Tôi đi học / Tôi đi đến trường.",
        "i am eating": "Tôi đang ăn.",
        "im eating": "Tôi đang ăn.",
        "i am eating an apple": "Tôi đang ăn một quả táo.",
        "im eating an apple": "Tôi đang ăn một quả táo.",
        "i have a book": "Tôi có một cuốn sách.",
        "this is an apple": "Đây là một quả táo.",
        "this is a book": "Đây là một cuốn sách.",
        "she is beautiful": "Cô ấy thật xinh đẹp.",
        "i love you": "Tôi yêu bạn / Tôi yêu em.",
        "what is your name": "Tên của bạn là gì?",
        "how are you": "Bạn khỏe không?",
        "he is a doctor": "Anh ấy là một bác sĩ.",
        "i have a dog": "Tôi có một con chó.",
        "they are students": "Họ là học sinh / sinh viên.",
        "theyre students": "Họ là học sinh / sinh viên.",
        "we are learning english": "Chúng tôi đang học tiếng Anh.",
        "im learning english": "Tôi đang học tiếng Anh.",
        "were learning english": "Chúng tôi đang học tiếng Anh.",
        "it is raining": "Trời đang mưa.",
        "the book is on the table": "Cuốn sách ở trên bàn.",
        "i am a student": "Tôi là học sinh.",
        "im a student": "Tôi là học sinh.",
        "he is happy": "Anh ấy hạnh phúc.",
        "they are not at home": "Họ không có ở nhà.",
        "is she your teacher": "Cô ấy có phải là giáo viên của bạn không?",
        "i work every day": "Tôi làm việc mỗi ngày.",
        "she works every day": "Cô ấy làm việc mỗi ngày.",
        "we dont like coffee": "Chúng tôi không thích cà phê.",
        "we do not like coffee": "Chúng tôi không thích cà phê.",
        "he doesnt like coffee": "Anh ấy không thích cà phê.",
        "he does not like coffee": "Anh ấy không thích cà phê.",
        "do you play soccer": "Bạn có chơi bóng đá không?",
        "does he play soccer": "Anh ấy có chơi bóng đá không?",
        "i was tired yesterday": "Hôm qua tôi đã mệt mỏi.",
        "they were at school": "Họ đã ở trường học.",
        "she wasnt happy": "Cô ấy đã không hạnh phúc.",
        "she was not happy": "Cô ấy đã không hạnh phúc.",
        "were you at home last night": "Tối qua bạn có ở nhà không?",
        "she studied last night": "Tối qua cô ấy đã học bài.",
        "he went to school": "Anh ấy đã đi học / đã đến trường.",
        "i didnt go to the party": "Tôi đã không đi đến bữa tiệc.",
        "i did not go to the party": "Tôi đã không đi đến bữa tiệc.",
        "did you call me yesterday": "Hôm qua bạn có gọi cho tôi không?",
        "i will help you": "Tôi sẽ giúp bạn.",
        "she will call you tomorrow": "Cô ấy sẽ gọi cho bạn vào ngày mai.",
        "he wont be late": "Anh ấy sẽ không đi trễ đâu.",
        "he will not be late": "Anh ấy sẽ không đi trễ đâu.",
        "will you come to the party": "Bạn sẽ đến bữa tiệc chứ?",
        "i am going to study tonight": "Tối nay tôi sẽ học bài.",
        "they are going to travel next month": "Tháng sau họ sẽ đi du lịch.",
        "she isnt going to join us": "Cô ấy sẽ không tham gia cùng chúng ta.",
        "she is not going to join us": "Cô ấy sẽ không tham gia cùng chúng ta."
    };
    
    return commonTranslations[cleanQuery] || null;
}

/* ================================================================
   PROGRESS TRACKER MODULE
   ================================================================ */

// --- Storage Keys ---
const TRACKER_LOGS_KEY  = 'easyenglish_tracker_logs';
const TRACKER_GOALS_KEY = 'easyenglish_tracker_goals';

// --- Default weekly goals (minutes) ---
const DEFAULT_GOALS = { listening: 60, speaking: 30, reading: 60, writing: 30 };

// ---- Helper: get YYYY-MM-DD string for a date ----
function dateKey(d) {
    return d.toISOString().slice(0, 10);
}

// ---- Helper: load all logs from localStorage ----
function loadAllLogs() {
    try { return JSON.parse(localStorage.getItem(TRACKER_LOGS_KEY)) || []; }
    catch(e) { return []; }
}

// ---- Helper: load goals ----
function loadGoals() {
    try { return Object.assign({}, DEFAULT_GOALS, JSON.parse(localStorage.getItem(TRACKER_GOALS_KEY))); }
    catch(e) { return Object.assign({}, DEFAULT_GOALS); }
}

// ---- Add minutes via quick-add buttons ----
function addMinutes(inputId, amount) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.value = Math.max(0, (parseInt(el.value) || 0) + amount);
}

// ---- Save today's log ----
function saveTrackerLog() {
    const listening = parseInt(document.getElementById('log-listening').value) || 0;
    const speaking  = parseInt(document.getElementById('log-speaking').value)  || 0;
    const reading   = parseInt(document.getElementById('log-reading').value)   || 0;
    const writing   = parseInt(document.getElementById('log-writing').value)   || 0;
    const note      = (document.getElementById('log-note').value || '').trim();

    if (listening + speaking + reading + writing === 0) {
        alert('Hãy nhập ít nhất 1 phút cho một kỹ năng!');
        return;
    }

    const today = dateKey(new Date());
    let logs = loadAllLogs();

    // Find existing entry for today and merge (add up)
    const existingIdx = logs.findIndex(l => l.date === today);
    if (existingIdx >= 0) {
        logs[existingIdx].listening += listening;
        logs[existingIdx].speaking  += speaking;
        logs[existingIdx].reading   += reading;
        logs[existingIdx].writing   += writing;
        if (note) logs[existingIdx].note = note;
    } else {
        logs.unshift({ date: today, listening, speaking, reading, writing, note });
    }

    localStorage.setItem(TRACKER_LOGS_KEY, JSON.stringify(logs));

    // Reset inputs
    ['log-listening','log-speaking','log-reading','log-writing'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('log-note').value = '';

    // Show success
    const msg = document.getElementById('save-success-msg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2500);

    // Refresh all displays
    loadTrackerData();
}

// ---- Main loader: refresh all tracker UI ----
function loadTrackerData() {
    const logs  = loadAllLogs();
    const goals = loadGoals();
    const today = dateKey(new Date());

    // --- Today total ---
    const todayLog = logs.find(l => l.date === today) || { listening:0, speaking:0, reading:0, writing:0 };
    const todayTotal = todayLog.listening + todayLog.speaking + todayLog.reading + todayLog.writing;
    const el = document.getElementById('tracker-total-today');
    if (el) el.textContent = todayTotal;

    // --- Date label ---
    const dateLabel = document.getElementById('tracker-today-label');
    if (dateLabel) {
        const now = new Date();
        const days = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
        dateLabel.textContent = `${days[now.getDay()]}, ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    }

    // --- Streak ---
    updateStreakDisplay(logs);

    // --- Weekly stats (current week Mon-Sun) ---
    const weekLogs = getWeekLogs(logs);
    const weekTotals = { listening:0, speaking:0, reading:0, writing:0 };
    weekLogs.forEach(l => {
        weekTotals.listening += l.listening;
        weekTotals.speaking  += l.speaking;
        weekTotals.reading   += l.reading;
        weekTotals.writing   += l.writing;
    });
    ['listening','speaking','reading','writing'].forEach(skill => {
        const el2 = document.getElementById(`tstat-${skill}`);
        if (el2) el2.textContent = weekTotals[skill];
    });

    // --- 7-day bar chart ---
    renderWeekChart(logs);

    // --- Donut chart ---
    renderDonutChart(weekTotals);

    // --- Goal bars ---
    renderGoalBars(weekTotals, goals);

    // --- History log ---
    renderHistoryLog(logs);

    // --- Populate goal inputs with saved values ---
    Object.keys(goals).forEach(skill => {
        const inp = document.getElementById(`goal-input-${skill}`);
        if (inp) inp.value = goals[skill];
    });
}

// ---- Get logs for the current Mon-Sun week ----
function getWeekLogs(logs) {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    return logs.filter(l => {
        const d = new Date(l.date);
        return d >= monday && d <= sunday;
    });
}

// ---- Streak calculator ----
function updateStreakDisplay(logs) {
    if (!logs.length) { setStreak(0); return; }
    const sortedDates = [...new Set(logs.map(l => l.date))].sort().reverse();
    const today = dateKey(new Date());
    const yesterday = dateKey(new Date(Date.now() - 86400000));
    // Streak must start from today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) { setStreak(0); return; }
    let streak = 0;
    let checkDate = sortedDates[0] === today ? new Date() : new Date(Date.now() - 86400000);
    for (let i = 0; i < sortedDates.length; i++) {
        if (sortedDates[i] === dateKey(checkDate)) {
            streak++;
            checkDate = new Date(checkDate.getTime() - 86400000);
        } else break;
    }
    setStreak(streak);
}
function setStreak(n) {
    const el = document.getElementById('tracker-streak-count');
    if (el) el.textContent = n;
    const badge = document.getElementById('tracker-streak-badge');
    if (badge) badge.style.opacity = n > 0 ? '1' : '0.5';
}

// ---- 7-day Bar Chart ----
function renderWeekChart(logs) {
    const container = document.getElementById('week-chart');
    if (!container) return;
    container.innerHTML = '';

    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        days.push({ date: dateKey(d), label: formatChartLabel(d), isToday: i === 0 });
    }

    // Find max total for scaling
    let maxTotal = 0;
    const dayData = days.map(day => {
        const log = logs.find(l => l.date === day.date) || { listening:0, speaking:0, reading:0, writing:0 };
        const total = log.listening + log.speaking + log.reading + log.writing;
        if (total > maxTotal) maxTotal = total;
        return { ...day, ...log, total };
    });
    if (maxTotal === 0) maxTotal = 60; // default scale

    const MAX_HEIGHT = 130; // px

    dayData.forEach(day => {
        const col = document.createElement('div');
        col.className = 'chart-day-col';

        const bars = document.createElement('div');
        bars.className = 'chart-bars';

        ['writing','reading','speaking','listening'].forEach(skill => {
            const val = day[skill] || 0;
            const h = Math.round((val / maxTotal) * MAX_HEIGHT);
            if (h > 0) {
                const bar = document.createElement('div');
                bar.className = `chart-bar bar-${skill}`;
                bar.style.height = h + 'px';
                bar.title = `${skill}: ${val} phút`;
                bars.appendChild(bar);
            }
        });

        col.appendChild(bars);

        const label = document.createElement('div');
        label.className = 'chart-day-label' + (day.isToday ? ' today' : '');
        label.textContent = day.label;
        col.appendChild(label);

        container.appendChild(col);
    });
}
function formatChartLabel(d) {
    const days = ['CN','T2','T3','T4','T5','T6','T7'];
    return days[d.getDay()];
}

// ---- Donut Chart (SVG stroke-dasharray trick) ----
function renderDonutChart(weekTotals) {
    const total = weekTotals.listening + weekTotals.speaking + weekTotals.reading + weekTotals.writing;
    const CIRCUM = 283; // 2 * PI * r = 2 * 3.14159 * 45 ≈ 283

    const centerEl = document.getElementById('donut-center-val');
    if (centerEl) centerEl.textContent = total;

    const skills = ['listening','speaking','reading','writing'];
    const colors  = { listening:'#22d3ee', speaking:'#a78bfa', reading:'#34d399', writing:'#fb923c' };

    let offset = 0;
    skills.forEach(skill => {
        const val = weekTotals[skill] || 0;
        const pct = total > 0 ? val / total : 0;
        const dash = Math.round(pct * CIRCUM);
        const gap  = CIRCUM - dash;

        const seg = document.getElementById(`donut-${skill}`);
        if (seg) {
            seg.setAttribute('stroke-dasharray', `${dash} ${gap}`);
            seg.setAttribute('stroke-dashoffset', -offset);
        }
        offset += dash;

        const pctEl = document.getElementById(`donut-pct-${skill}`);
        if (pctEl) pctEl.textContent = total > 0 ? Math.round(pct*100) + '%' : '0%';
    });
}

// ---- Goal Progress Bars ----
function renderGoalBars(weekTotals, goals) {
    ['listening','speaking','reading','writing'].forEach(skill => {
        const goal = goals[skill] || DEFAULT_GOALS[skill];
        const val  = weekTotals[skill] || 0;
        const pct  = Math.min(100, Math.round((val / goal) * 100));

        const prog = document.getElementById(`goal-${skill}-progress`);
        if (prog) prog.textContent = `${val} / ${goal} phút`;

        const bar = document.getElementById(`goal-bar-${skill}`);
        if (bar) bar.style.width = pct + '%';
    });
}

// ---- History Log ----
function renderHistoryLog(logs) {
    const container = document.getElementById('history-log-list');
    if (!container) return;
    if (!logs.length) {
        container.innerHTML = '<div class="empty-state">Chưa có nhật ký nào. Hãy ghi lại hoạt động học tập hôm nay ở trên! 📝</div>';
        return;
    }

    container.innerHTML = logs.slice(0, 30).map(log => {
        const d = new Date(log.date + 'T00:00:00');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const total = (log.listening||0) + (log.speaking||0) + (log.reading||0) + (log.writing||0);

        const skillTags = [
            log.listening ? `<span class="history-skill-tag tag-l">🎧 ${log.listening}p</span>` : '',
            log.speaking  ? `<span class="history-skill-tag tag-s">🗣️ ${log.speaking}p</span>`  : '',
            log.reading   ? `<span class="history-skill-tag tag-r">📖 ${log.reading}p</span>`   : '',
            log.writing   ? `<span class="history-skill-tag tag-w">✍️ ${log.writing}p</span>`   : '',
        ].filter(Boolean).join('');

        return `
        <div class="history-entry">
            <div class="history-date-badge">
                <div class="history-date-day">${d.getDate()}</div>
                <div class="history-date-month">${months[d.getMonth()]}</div>
            </div>
            <div class="history-entry-content">
                <div class="history-skills">${skillTags}</div>
                ${log.note ? `<div class="history-note">💬 ${log.note}</div>` : ''}
            </div>
            <div class="history-total">${total} phút</div>
        </div>`;
    }).join('');
}

// ---- Save Goals ----
function saveGoals() {
    const goals = {
        listening: parseInt(document.getElementById('goal-input-listening').value) || DEFAULT_GOALS.listening,
        speaking:  parseInt(document.getElementById('goal-input-speaking').value)  || DEFAULT_GOALS.speaking,
        reading:   parseInt(document.getElementById('goal-input-reading').value)   || DEFAULT_GOALS.reading,
        writing:   parseInt(document.getElementById('goal-input-writing').value)   || DEFAULT_GOALS.writing,
    };
    localStorage.setItem(TRACKER_GOALS_KEY, JSON.stringify(goals));
    toggleGoalsEdit();
    loadTrackerData();
}

// ---- Toggle goal edit panel ----
function toggleGoalsEdit() {
    const display = document.getElementById('goals-display');
    const edit    = document.getElementById('goals-edit');
    const btn     = document.getElementById('btn-edit-goals');
    if (!display || !edit) return;
    const isEditing = !edit.classList.contains('hidden');
    edit.classList.toggle('hidden', isEditing);
    display.classList.toggle('hidden', !isEditing);
    if (btn) btn.textContent = isEditing ? 'Chỉnh sửa' : 'Huỷ';
}

// ---- Clear all history ----
function clearTrackerHistory() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử nhật ký không?')) return;
    localStorage.removeItem(TRACKER_LOGS_KEY);
    loadTrackerData();
}

// ---- Auto-init when progress tab is opened ----
const _origSwitchTab = typeof switchTab === 'function' ? switchTab : null;
// Patch switchTab to init tracker
(function patchSwitchTab() {
    const origSwitchTab = window.switchTab;
    if (!origSwitchTab) return;
    window.switchTab = function(tabId) {
        origSwitchTab(tabId);
        if (tabId === 'progress') {
            setTimeout(loadTrackerData, 100);
        }
    };
})();

// Load tracker data immediately if we're on the progress tab
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#tab-progress.active')) {
        loadTrackerData();
    }
    // Also patch after DOM loads
    const orig = window.switchTab;
    if (orig) {
        window.switchTab = function(tabId) {
            orig(tabId);
            if (tabId === 'progress') setTimeout(loadTrackerData, 100);
        };
    }
});

