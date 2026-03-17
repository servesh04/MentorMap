/**
 * Bot Identity Pool & XP Distribution Engine
 * 
 * Provides ~60 realistic bot identities and a tiered XP generator
 * to fill league buckets to 30 players when real users are scarce.
 */

interface BotIdentity {
    id: string;
    displayName: string;
    photoURL: string;
}

const BOT_POOL: BotIdentity[] = [
    // Indian names
    { id: 'bot_arjun_01', displayName: 'Arjun M.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Arjun' },
    { id: 'bot_priya_02', displayName: 'Priya S.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Priya' },
    { id: 'bot_vikram_03', displayName: 'Vikram R.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Vikram' },
    { id: 'bot_ananya_04', displayName: 'Ananya K.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Ananya' },
    { id: 'bot_rahul_05', displayName: 'Rahul D.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Rahul' },
    { id: 'bot_sneha_06', displayName: 'Sneha P.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sneha' },
    { id: 'bot_karthik_07', displayName: 'Karthik V.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Karthik' },
    { id: 'bot_divya_08', displayName: 'Divya N.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Divya' },
    { id: 'bot_aditya_09', displayName: 'Aditya B.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Aditya' },
    { id: 'bot_meera_10', displayName: 'Meera L.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Meera' },
    { id: 'bot_rohan_11', displayName: 'Rohan G.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Rohan' },
    { id: 'bot_ishita_12', displayName: 'Ishita T.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Ishita' },
    { id: 'bot_siddharth_13', displayName: 'Siddharth J.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Siddharth' },
    { id: 'bot_kavya_14', displayName: 'Kavya C.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Kavya' },
    { id: 'bot_nikhil_15', displayName: 'Nikhil A.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Nikhil' },

    // Western names
    { id: 'bot_emily_16', displayName: 'Emily Chen', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Emily' },
    { id: 'bot_james_17', displayName: 'James W.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=James' },
    { id: 'bot_sarah_18', displayName: 'Sarah K.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sarah' },
    { id: 'bot_michael_19', displayName: 'Michael T.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Michael' },
    { id: 'bot_olivia_20', displayName: 'Olivia R.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Olivia' },
    { id: 'bot_ethan_21', displayName: 'Ethan H.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Ethan' },
    { id: 'bot_chloe_22', displayName: 'Chloe B.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Chloe' },
    { id: 'bot_daniel_23', displayName: 'Daniel F.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Daniel' },
    { id: 'bot_sophia_24', displayName: 'Sophia L.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sophia' },
    { id: 'bot_noah_25', displayName: 'Noah P.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Noah' },

    // East Asian names
    { id: 'bot_yuki_26', displayName: 'Yuki T.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Yuki' },
    { id: 'bot_wei_27', displayName: 'Wei L.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Wei' },
    { id: 'bot_minjun_28', displayName: 'Min-jun K.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Minjun' },
    { id: 'bot_hana_29', displayName: 'Hana S.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Hana' },
    { id: 'bot_riku_30', displayName: 'Riku M.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Riku' },

    // Middle Eastern / African names
    { id: 'bot_omar_31', displayName: 'Omar A.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Omar' },
    { id: 'bot_fatima_32', displayName: 'Fatima Z.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Fatima' },
    { id: 'bot_kwame_33', displayName: 'Kwame O.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Kwame' },
    { id: 'bot_amara_34', displayName: 'Amara N.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Amara' },
    { id: 'bot_hassan_35', displayName: 'Hassan M.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Hassan' },

    // Latin American names
    { id: 'bot_mateo_36', displayName: 'Mateo G.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Mateo' },
    { id: 'bot_valentina_37', displayName: 'Valentina R.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Valentina' },
    { id: 'bot_santiago_38', displayName: 'Santiago P.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Santiago' },
    { id: 'bot_camila_39', displayName: 'Camila F.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Camila' },
    { id: 'bot_lucas_40', displayName: 'Lucas D.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Lucas' },

    // European names
    { id: 'bot_lena_41', displayName: 'Lena W.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Lena' },
    { id: 'bot_finn_42', displayName: 'Finn O.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Finn' },
    { id: 'bot_elise_43', displayName: 'Elise M.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Elise' },
    { id: 'bot_marco_44', displayName: 'Marco B.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Marco' },
    { id: 'bot_clara_45', displayName: 'Clara V.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Clara' },

    // More Indian names
    { id: 'bot_deepak_46', displayName: 'Deepak S.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Deepak' },
    { id: 'bot_riya_47', displayName: 'Riya G.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Riya' },
    { id: 'bot_harsh_48', displayName: 'Harsh P.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Harsh' },
    { id: 'bot_pooja_49', displayName: 'Pooja T.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Pooja' },
    { id: 'bot_varun_50', displayName: 'Varun K.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Varun' },

    // Additional diverse names
    { id: 'bot_alex_51', displayName: 'Alex J.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Alex' },
    { id: 'bot_nina_52', displayName: 'Nina R.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Nina' },
    { id: 'bot_sam_53', displayName: 'Sam C.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sam' },
    { id: 'bot_iris_54', displayName: 'Iris H.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Iris' },
    { id: 'bot_leo_55', displayName: 'Leo T.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Leo' },
    { id: 'bot_maya_56', displayName: 'Maya D.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Maya' },
    { id: 'bot_raj_57', displayName: 'Raj N.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Raj' },
    { id: 'bot_zara_58', displayName: 'Zara F.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Zara' },
    { id: 'bot_kai_59', displayName: 'Kai W.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Kai' },
    { id: 'bot_luna_60', displayName: 'Luna B.', photoURL: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Luna' },
];

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 */
const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

/**
 * Randomly samples `count` bot identities from the pool.
 */
export const sampleBots = (count: number): BotIdentity[] => {
    return shuffle(BOT_POOL).slice(0, count);
};

/**
 * Returns a random integer between min and max (inclusive).
 */
const randInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates 29 pre-sorted XP values using a tiered distribution.
 * Returned in descending order (highest XP first).
 * 
 * | Slot Range   | XP Range  | Purpose                           |
 * |-------------|-----------|-----------------------------------|
 * | 1–3 (Top)    | 800–1500  | Pressure the real user to grind   |
 * | 4–10 (Upper) | 400–799   | Competitive middle pack           |
 * | 11–20 (Mid)  | 100–399   | Casual learners                   |
 * | 21–27 (Low)  | 10–99     | Light activity                    |
 * | 28–29 (Dead) | 0         | Simulates dormant users           |
 */
export const generateBotXpValues = (): number[] => {
    const values: number[] = [];

    // Top tier (3 bots)
    for (let i = 0; i < 3; i++) values.push(randInt(800, 1500));
    // Upper tier (7 bots)
    for (let i = 0; i < 7; i++) values.push(randInt(400, 799));
    // Mid tier (10 bots)
    for (let i = 0; i < 10; i++) values.push(randInt(100, 399));
    // Low tier (7 bots)
    for (let i = 0; i < 7; i++) values.push(randInt(10, 99));
    // Inactive (2 bots)
    values.push(0, 0);

    // Sort descending
    return values.sort((a, b) => b - a);
};
