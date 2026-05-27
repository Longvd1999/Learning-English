// App State
let currentTab = 'ipa'; // default starting tab
let currentPracticeTopic = 'grammar'; // default topic
let currentScore = 0;
let answeredQuestionsCount = 0;
let correctAnswersCount = 0;
let correctIpaAnswersCount = 0; // For Pronunciation Pro Badge
let streak = 0;
let currentQuestionIndex = 0;
let userAnswers = []; // Track answered questions details
let selectedWords = []; // For word ordering questions
let savedVocabList = []; // Vocabulary Notebook

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
const questionsDatabase = {
    grammar: [
        {
            type: 'mcq',
            question: 'She _______ (study) English every night.',
            illustration: 'student', // Custom SVG reference
            options: ['study', 'studies', 'studys', 'studying'],
            correct: 'studies',
            explanation: 'Chủ ngữ là "She" (ngôi thứ 3 số ít), động từ "study" kết thúc bằng phụ âm + "y", ta đổi "y" thành "i" rồi thêm "es".'
        },
        {
            type: 'mcq',
            question: 'The train _______ at 8:00 AM every morning.',
            illustration: 'train',
            options: ['leave', 'leaves', 'leaving', 'is leave'],
            correct: 'leaves',
            explanation: 'Diễn tả lịch trình cố định của phương tiện giao thông. "The train" là danh từ số ít nên động từ "leave" thêm "s".'
        },
        {
            type: 'fitb',
            question: 'He _______ (go) to school by bus.',
            illustration: 'bus',
            correct: ['goes'],
            explanation: 'Chủ ngữ "He" (ngôi thứ 3 số ít), động từ "go" kết thúc bằng chữ "o" nên ta thêm đuôi "es".'
        },
        {
            type: 'fitb',
            question: 'Water _______ (boil) at 100 degrees Celsius.',
            illustration: 'water',
            correct: ['boils'],
            explanation: 'Diễn tả một chân lý, sự thật hiển nhiên. "Water" là danh từ số ít không đếm được nên động từ thêm "s".'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Anh ấy thường chơi bóng đá vào thứ Bảy."',
            words: ['He', 'usually', 'plays', 'soccer', 'on', 'Saturdays'],
            correct: 'He usually plays soccer on Saturdays',
            explanation: 'Trạng từ chỉ tần suất (usually) đứng trước động từ thường (plays). Trật tự: S + trạng từ + V + O + Trạng từ chỉ thời gian.'
        },
        {
            type: 'mcq',
            question: 'We _______ (not watch) TV in the morning.',
            options: ['not watch', 'watches not', "don't watch", "doesn't watch"],
            correct: "don't watch",
            explanation: 'Chủ ngữ "We" số nhiều, trong câu phủ định dùng trợ động từ "don\'t" (do not) + động từ nguyên mẫu.'
        },
        {
            type: 'fitb',
            question: 'What time _______ you usually wake up?',
            correct: ['do'],
            explanation: 'Câu hỏi dùng từ để hỏi (Wh-), chủ ngữ là "you" nên dùng trợ động từ "do".'
        }
    ],
    ipa: [
        {
            type: 'mcq',
            question: 'Chọn từ có phát âm nguyên âm <b>KHÁC</b> các từ còn lại:',
            illustration: 'ear',
            options: ['sheep (/i:/)', 'meat (/i:/)', 'ship (/ɪ/)', 'see (/i:/)'],
            correct: 'ship (/ɪ/)',
            explanation: 'Từ "ship" chứa nguyên âm ngắn /ɪ/, trong khi 3 từ còn lại chứa nguyên âm dài /i:/.'
        },
        {
            type: 'mcq',
            question: 'Từ nào dưới đây có cách phát âm đuôi <b>-s / -es</b> là <b>/s/</b>?',
            options: ['plays', 'works', 'watches', 'loves'],
            correct: 'works',
            explanation: 'Từ "works" kết thúc bằng âm vô thanh /k/, do đó đuôi -s phát âm là /s/. Các từ khác phát âm là /z/ hoặc /ɪz/.'
        },
        {
            type: 'mcq',
            question: 'Phát âm của âm được gạch chân trong từ "f<b>a</b>ther" là âm gì?',
            options: ['/æ/', '/ʌ/', '/ɑ:/', '/e/'],
            correct: '/ɑ:/',
            explanation: 'Từ "father" phát âm là /ˈfɑːðər/ với nguyên âm dài /ɑ:/.'
        },
        {
            type: 'fitb',
            question: 'Âm phát âm nào là âm hữu thanh (Voiced) trong hai âm /s/ và /z/?',
            correct: ['/z/', 'z'],
            explanation: 'Âm /z/ yêu cầu rung dây thanh quản (Hữu thanh), trong khi âm /s/ chỉ có tiếng gió bật ra (Vô thanh).'
        },
        {
            type: 'mcq',
            question: 'Từ nào có phát âm đuôi <b>-es</b> được phát âm là <b>/ɪz/</b>?',
            illustration: 'clock',
            options: ['goes', 'lives', 'watches', 'runs'],
            correct: 'watches',
            explanation: 'Từ "watch" kết thúc bằng âm xuýt /tʃ/, do đó đuôi -es của nó được phát âm là /ɪz/.'
        }
    ],

    // ==========================================
    // THÌ QUÁ KHỨ ĐƠN (Past Simple)
    // ==========================================
    pastSimple: [
        {
            type: 'mcq',
            question: 'She _______ (go) to the cinema last Friday.',
            illustration: 'student',
            options: ['go', 'goes', 'went', 'going'],
            correct: 'went',
            explanation: '"Go" là động từ bất quy tắc. Dạng quá khứ đơn của "go" là "went". Dấu hiệu "last Friday" cho biết đây là thì quá khứ đơn.'
        },
        {
            type: 'mcq',
            question: 'They _______ (not eat) dinner yesterday.',
            options: ["didn't eat", "don't eat", "doesn't eat", "weren't eat"],
            correct: "didn't eat",
            explanation: 'Câu phủ định quá khứ đơn: S + didn\'t + V_nguyên_mẫu. "Didn\'t" dùng cho mọi chủ ngữ, động từ trở về nguyên mẫu "eat".'
        },
        {
            type: 'fitb',
            question: 'I _______ (study) for the exam all night.',
            illustration: 'student',
            correct: ['studied'],
            explanation: '"Study" kết thúc bằng phụ âm + y, đổi y→i rồi thêm -ed thành "studied". Đây là động từ có quy tắc.'
        },
        {
            type: 'fitb',
            question: 'He _______ (be) very tired after work.',
            correct: ['was'],
            explanation: 'Dạng quá khứ của TO BE: I/He/She/It → was | You/We/They → were. Chủ ngữ "He" nên dùng "was".'
        },
        {
            type: 'mcq',
            question: '_______ you see that movie last week?',
            options: ['Do', 'Did', 'Was', 'Were'],
            correct: 'Did',
            explanation: 'Câu hỏi quá khứ đơn với động từ thường: Did + S + V_nguyên_mẫu? "Did" dùng cho mọi chủ ngữ.'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Cô ấy đã mua một chiếc váy mới hôm qua."',
            words: ['She', 'bought', 'a', 'new', 'dress', 'yesterday'],
            correct: 'She bought a new dress yesterday',
            explanation: '"Buy" là động từ bất quy tắc, dạng V2 là "bought". Trật tự câu: S + V2 + O + Trạng từ thời gian.'
        },
        {
            type: 'mcq',
            question: 'When I was a child, I _______ (play) in the park every day.',
            options: ['play', 'played', 'plays', 'was play'],
            correct: 'played',
            explanation: '"When I was a child" chỉ thời điểm trong quá khứ. "Play" là động từ có quy tắc, thêm -ed thành "played".'
        },
        {
            type: 'fitb',
            question: 'The students _______ (not finish) their homework on time.',
            correct: ["didn't finish", "did not finish"],
            explanation: 'Phủ định quá khứ đơn: didn\'t + V_nguyên_mẫu. "The students" là số nhiều nhưng vẫn dùng "didn\'t" (không phải "weren\'t" vì đây là động từ thường).'
        }
    ],

    // ==========================================
    // THÌ TƯƠNG LAI ĐƠN (Future Simple)
    // ==========================================
    futureSimple: [
        {
            type: 'mcq',
            question: 'I _______ help you with your homework tonight.',
            illustration: 'student',
            options: ['am', 'was', 'will', 'would'],
            correct: 'will',
            explanation: 'Quyết định tức thì khi được yêu cầu giúp đỡ → dùng WILL. Công thức: S + will + V_nguyên_mẫu.'
        },
        {
            type: 'mcq',
            question: 'She _______ (not come) to the party tomorrow.',
            options: ["didn't come", "won't come", "doesn't come", "isn't come"],
            correct: "won't come",
            explanation: 'Phủ định tương lai đơn: S + won\'t (will not) + V_nguyên_mẫu. "Won\'t" là dạng rút gọn của "will not".'
        },
        {
            type: 'fitb',
            question: '_______ you be at home this evening?',
            correct: ['Will'],
            explanation: 'Câu hỏi tương lai đơn: Will + S + V_nguyên_mẫu? "Will" đứng đầu câu hỏi.'
        },
        {
            type: 'mcq',
            question: 'Look at those dark clouds! It _______ rain.',
            options: ['will', 'is going to', 'would', 'shall'],
            correct: 'is going to',
            explanation: 'Dấu hiệu rõ ràng (dark clouds) cho thấy điều sắp xảy ra → dùng BE GOING TO. "It is going to rain" = trời sắp mưa.'
        },
        {
            type: 'fitb',
            question: 'We _______ (visit) Hoi An next month. (Dùng be going to)',
            correct: ['are going to visit'],
            explanation: 'Kế hoạch đã định sẵn từ trước → BE GOING TO. We + are going to + visit.'
        },
        {
            type: 'order',
            question: 'Hãy xếp các từ thành câu đúng: "Anh ấy sẽ gọi điện cho bạn vào ngày mai."',
            words: ['He', 'will', 'call', 'you', 'tomorrow'],
            correct: 'He will call you tomorrow',
            explanation: 'Công thức tương lai đơn: S + will + V_nguyên_mẫu + O + Trạng từ thời gian. "Will" không thay đổi theo chủ ngữ.'
        },
        {
            type: 'mcq',
            question: 'I\'m hungry. — Don\'t worry, I _______ make you a sandwich.',
            options: ['am going to', 'will', 'shall', 'would'],
            correct: 'will',
            explanation: 'Quyết định ngay tại thời điểm nói (tức thì) → dùng WILL, không phải "be going to" (vốn dùng cho kế hoạch đã chuẩn bị trước).'
        },
        {
            type: 'mcq',
            question: 'By 2050, robots _______ do many jobs for humans.',
            options: ['will', 'are going to', 'would', 'A hoặc B đều đúng'],
            correct: 'A hoặc B đều đúng',
            explanation: 'Dự đoán xa (không có bằng chứng rõ ràng) thường dùng WILL. Nhưng nếu có dấu hiệu thì BE GOING TO cũng được. Cả hai đều chấp nhận được trong câu dự đoán.'
        }
    ]
};


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
function drawMouthSVG(symbol) {
    const svg = document.getElementById('mouth-svg');
    if (!svg) return;
    
    let lipsProfile = "neutral";
    let tongueProfile = "neutral";
    let voiceActive = true;
    
    const soundData = allIpaSounds.find(s => s.symbol === symbol);
    if (soundData) {
        voiceActive = (soundData.voicing === "voiced");
        
        // Categorize profile based on details
        if (["/i:/", "/ɪ/", "/e/", "/æ/"].includes(symbol)) {
            lipsProfile = "open-spread";
            tongueProfile = symbol === "/i:/" || symbol === "/ɪ/" ? "high-front" : "low-front";
        } else if (["/u:/", "/ʊ/", "/ɔ:/", "/ɒ/"].includes(symbol)) {
            lipsProfile = "open-round";
            tongueProfile = symbol === "/u:/" || symbol === "/ʊ/" ? "high-back" : "low-back";
        } else if (["/ʌ/", "/ɑ:/", "/ə/", "/ɜ:/"].includes(symbol)) {
            lipsProfile = "neutral";
            tongueProfile = symbol === "/ɑ:/" ? "low-back" : "neutral";
        } else if (["/p/", "/b/", "/m/"].includes(symbol)) {
            lipsProfile = "closed";
            tongueProfile = "neutral";
        } else if (["/f/", "/v/"].includes(symbol)) {
            lipsProfile = "lip-bite";
            tongueProfile = "neutral";
        } else if (["/θ/", "/ð/"].includes(symbol)) {
            lipsProfile = "narrow";
            tongueProfile = "touch-teeth";
        } else if (["/t/", "/d/", "/n/", "/l/", "/s/", "/z/"].includes(symbol)) {
            lipsProfile = "narrow";
            tongueProfile = "touch-alveolar";
        } else if (["/k/", "/g/", "/ŋ/"].includes(symbol)) {
            lipsProfile = "narrow";
            tongueProfile = "velar-block";
        }
    }

    // SVG elements calculation
    let upperLip = "";
    let lowerLip = "";
    let teeth = "";
    let tongue = "";
    let vocalCords = "";

    // Lips configuration
    if (lipsProfile === "closed") {
        upperLip = "M 70 65 Q 85 70 85 70";
        lowerLip = "M 85 70 Q 85 70 70 85";
    } else if (lipsProfile === "open-spread") {
        upperLip = "M 65 52 Q 78 58 85 64";
        lowerLip = "M 65 98 Q 78 92 85 86";
        teeth = "M 82 64 V 68 M 82 86 V 82";
    } else if (lipsProfile === "open-round") {
        upperLip = "M 68 56 Q 72 63 76 66";
        lowerLip = "M 68 94 Q 72 87 76 84";
        teeth = "M 74 65 V 68 M 74 85 V 82";
    } else if (lipsProfile === "lip-bite") {
        upperLip = "M 68 53 Q 78 58 82 66";
        lowerLip = "M 65 94 Q 80 82 82 72"; // Tucked bottom lip
        teeth = "M 82 66 V 72";
    } else { // narrow / neutral
        upperLip = "M 67 56 Q 78 60 82 67";
        lowerLip = "M 67 94 Q 78 90 82 83";
        teeth = "M 80 67 V 71 M 80 83 V 79";
    }

    // Tongue position configuration
    if (tongueProfile === "high-front") {
        tongue = "M 115 110 C 110 75, 95 65, 82 72 C 84 82, 98 94, 115 110 Z";
    } else if (tongueProfile === "low-front") {
        tongue = "M 115 110 C 110 88, 90 82, 80 86 C 82 92, 98 102, 115 110 Z";
    } else if (tongueProfile === "high-back") {
        tongue = "M 115 110 C 104 68, 94 78, 86 88 C 89 96, 99 104, 115 110 Z";
    } else if (tongueProfile === "low-back") {
        tongue = "M 115 110 C 110 93, 98 88, 90 93 C 92 100, 100 105, 115 110 Z";
    } else if (tongueProfile === "touch-teeth") {
        tongue = "M 115 110 C 105 85, 90 73, 76 73 C 78 80, 98 96, 115 110 Z";
    } else if (tongueProfile === "touch-alveolar") {
        tongue = "M 115 110 C 105 80, 92 63, 83 63 C 86 73, 98 93, 115 110 Z";
    } else if (tongueProfile === "velar-block") {
        tongue = "M 115 110 C 98 68, 92 82, 87 90 C 90 96, 100 104, 115 110 Z";
    } else { // neutral
        tongue = "M 115 110 C 105 88, 92 78, 84 83 C 87 93, 100 103, 115 110 Z";
    }

    // Vocal Cords vibration configuration
    if (voiceActive) {
        vocalCords = "M 125 120 Q 128 118, 131 120 T 137 120 T 143 120 T 149 120";
    } else {
        vocalCords = "M 125 120 L 150 120";
    }

    svg.innerHTML = `
        <!-- Palate / Oral cavity profile -->
        <path d="M 20 20 C 50 20, 75 30, 85 45 C 95 55, 98 70, 98 85 C 98 100, 92 120, 92 130" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5" stroke-linecap="round"/>
        <path d="M 20 140 C 50 140, 90 135, 115 110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5" stroke-linecap="round"/>
        
        <!-- Tongue -->
        <path d="${tongue}" fill="rgba(244, 63, 94, 0.35)" stroke="var(--error-light)" stroke-width="2.5" stroke-linejoin="round"/>
        
        <!-- Teeth (if visible) -->
        ${teeth ? `<path d="${teeth}" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>` : ''}
        
        <!-- Lips -->
        <path d="${upperLip}" fill="none" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round"/>
        <path d="${lowerLip}" fill="none" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round"/>
        
        <!-- Vocal Cords -->
        <path d="${vocalCords}" fill="none" stroke="${voiceActive ? 'var(--success-light)' : 'var(--text-muted)'}" stroke-width="2.5" stroke-linecap="round" ${voiceActive ? '' : 'stroke-dasharray="3,3"'}/>
        
        <text x="135" y="140" fill="var(--text-muted)" font-size="8" text-anchor="middle">Vocal cords</text>
    `;

    // Panel styling reflecting voicing state
    const waveEl = document.getElementById('voice-wave-animation');
    const voicingStatus = document.getElementById('voicing-status');
    const voicingText = document.getElementById('voicing-text');
    
    if (voiceActive) {
        voicingStatus.className = "voicing-status voiced";
        voicingText.textContent = "Hữu thanh (Voiced - Rung cổ họng)";
        if (waveEl) waveEl.style.display = "inline-block";
    } else {
        voicingStatus.className = "voicing-status voiceless";
        voicingText.textContent = "Vô thanh (Voiceless - Chỉ bật hơi)";
        if (waveEl) waveEl.style.display = "none";
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
        currentScore += 10;
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
    currentScore = 0;
    answeredQuestionsCount = 0;
    correctAnswersCount = 0;
    correctIpaAnswersCount = 0;
    streak = 0;
    userAnswers = [];
    usedGameWordIndices = [];

    // Re-init shuffled pool for infinite mode
    if (currentPracticeTopic !== 'game') {
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
    document.getElementById('current-score').textContent = currentScore;
    document.getElementById('answered-ratio').textContent = `${correctAnswersCount}/${answeredQuestionsCount}`;
    
    // Progress fill update
    const progressFill = document.getElementById('practice-progress');
    if (currentPracticeTopic === 'game') {
        progressFill.style.width = '100%'; // Infinite game mode
    } else {
        const topicQuestions = questionsDatabase[currentPracticeTopic] || [];
        const percent = topicQuestions.length > 0 ? (currentQuestionIndex / topicQuestions.length) * 100 : 0;
        progressFill.style.width = `${percent}%`;
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
        savedVocabList
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
            const resTrans = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|vi`);
            let viSentence = 'Không tìm thấy bản dịch.';
            if (resTrans.ok) {
                const td = await resTrans.json();
                const raw = td.responseData.translatedText || '';
                viSentence = new DOMParser().parseFromString(raw, 'text/html').body.textContent;
            }
            renderDictSentence(query, viSentence);
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

function renderDictSentence(sentence, viTranslation) {
    document.getElementById('dict-sentence-original').textContent = sentence;
    document.getElementById('dict-sentence-translation').textContent = viTranslation;
    document.getElementById('dict-sentence-result').classList.remove('hidden');
    document.getElementById('dict-result-wrapper').classList.add('hidden');
    setTimeout(() => speakText(sentence, 'us'), 500);
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
    if (svgEl && typeof renderMouthSVG === 'function') {
        renderMouthSVG(svgEl, sound);
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
