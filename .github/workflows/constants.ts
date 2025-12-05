/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    IdPhotoIcon,
    RestorationIcon,
    BackgroundIcon,
    ClothingIcon,
    BatchBackgroundIcon,
    PosingStudioIcon,
    MagicIcon,
    HairStyleIcon,
    VideoMarketingIcon,
} from './components';

export const TABS_CONFIG = [
    { id: 'id-photo', labelKey: 'tabLabel_id-photo', icon: IdPhotoIcon, descriptionKey: 'tabDescription_id-photo' },
    { id: 'ai-editor', labelKey: 'tabLabel_ai-editor', icon: MagicIcon, descriptionKey: 'tabDescription_ai-editor' },
    { id: 'batch-background', labelKey: 'tabLabel_batch-background', icon: BatchBackgroundIcon, descriptionKey: 'tabDescription_batch-background' },
    { id: 'clothing-change', labelKey: 'tabLabel_clothing-change', icon: ClothingIcon, descriptionKey: 'tabDescription_clothing-change' },
    { id: 'batch-clothing-change', labelKey: 'tabLabel_batch-clothing-change', icon: ClothingIcon, descriptionKey: 'tabDescription_batch-clothing-change' },
    { id: 'hair-style', labelKey: 'tabLabel_hair-style', icon: HairStyleIcon, descriptionKey: 'tabDescription_hair-style' },
    { id: 'baby-concept', labelKey: 'tabLabel_baby-concept', icon: MagicIcon, descriptionKey: 'tabDescription_baby-concept' },
    { id: 'restoration', labelKey: 'tabLabel_restoration', icon: RestorationIcon, descriptionKey: 'tabDescription_restoration' },
    { id: 'posing-studio', labelKey: 'tabLabel_posing-studio', icon: PosingStudioIcon, descriptionKey: 'tabDescription_posing-studio' },
    { id: 'trend-creator', labelKey: 'tabLabel_trend-creator', icon: MagicIcon, descriptionKey: 'tabDescription_trend-creator' },
    { id: 'video-marketing', labelKey: 'tabLabel_video-marketing', icon: VideoMarketingIcon, descriptionKey: 'tabDescription_video-marketing' },
];

export const ID_PHOTO_CLOTHING_PRESETS = [
  { labelKey: "clothing_whiteShirt", prompt: "Áo sơ mi trắng trơn cài cúc, kiểu trang trọng" },
  { labelKey: "clothing_blueShirt", prompt: "Áo sơ mi xanh nhạt trơn cài cúc, kiểu trang trọng" },
  { labelKey: "clothing_blackShirt", prompt: "Áo sơ mi đen trơn cài cúc, kiểu trang trọng" },
  { labelKey: "clothing_polo", prompt: "Áo polo một màu, đơn giản và gọn gàng" },
  { labelKey: "clothing_blouse", prompt: "Áo blouse nữ chuyên nghiệp, trơn màu" },
  { labelKey: "clothing_bowNeck", prompt: "Áo blouse gọn gàng với cổ thắt nơ nhỏ" },
  { labelKey: "clothing_suit", prompt: "Bộ vest công sở với áo sơ mi trắng và cà vạt, kiểu ảnh hộ chiếu" },
  { labelKey: "clothing_classicBlackVest", prompt: "Bộ vest đen cổ điển với áo sơ mi trắng và cà vạt tối màu" },
  { labelKey: "clothing_navyVest", prompt: "Bộ vest xanh navy với áo sơ mi trắng và cà vạt" },
  { labelKey: "clothing_charcoalVest", prompt: "Bộ vest xám than với áo sơ mi trắng và cà vạt" },
  { labelKey: "clothing_vestTie", prompt: "Bộ vest trang trọng với cà vạt trơn cùng tông" },
  { labelKey: "clothing_lightGreyVest", prompt: "Bộ vest màu ghi sáng với áo sơ mi trắng và cà vạt" },
  { labelKey: "clothing_whiteAoDai", prompt: "Áo dài truyền thống Việt Nam màu trắng trơn, kiểu ảnh hộ chiếu" },
  { labelKey: "clothing_femaleVest", prompt: "Áo khoác vest công sở nữ mặc ngoài một chiếc áo trơn" },
  { labelKey: "clothing_fittedFemaleVest", prompt: "Áo khoác vest nữ được may đo vừa vặn, phong cách chuyên nghiệp" },
];

export const ID_PHOTO_HAIRSTYLE_OPTIONS = [
    { key: 'original', labelKey: 'hairstyle_original' },
    { key: 'auto', labelKey: 'hairstyle_auto' },
    { key: 'shoulder_front', labelKey: 'hairstyle_shoulder_front' },
    { key: 'shoulder_back', labelKey: 'hairstyle_shoulder_back' },
    { key: 'ponytail', labelKey: 'hairstyle_ponytail' },
    { key: 'long_straight_smooth', labelKey: 'hairstyle_long_straight_smooth' },
    { key: 'slicked_back', labelKey: 'hairstyle_slicked_back' },
    { key: 'neat_male', labelKey: 'hairstyle_neat_male' },
    { key: 'tied_back', labelKey: 'hairstyle_tied_back' },
    { key: 'loose_waves', labelKey: 'hairstyle_loose_waves' },
    { key: 'straight_smooth', labelKey: 'hairstyle_straight_smooth' },
    { key: 'low_bun', labelKey: 'hairstyle_low_bun' },
    { key: 'bangs', labelKey: 'hairstyle_bangs' },
    { key: 'thicken', labelKey: 'hairstyle_thicken' },
];

export const HAIR_STYLE_SUGGESTIONS = {
    female: {
        'Tóc ngắn': [
            'Tóc bob ngắn ngang cằm, uốn cúp nhẹ',
            'Tóc pixie cá tính, mái xéo',
            'Tóc tém uốn xoăn nhẹ nhàng',
            'Tóc lob ngang vai, duỗi thẳng tự nhiên',
            'Tóc bob bất đối xứng, một bên dài một bên ngắn',
        ],
        'Tóc dài': [
            'Tóc dài thẳng mượt, óng ả',
            'Tóc dài xoăn sóng lơi tự nhiên',
            'Tóc dài uốn lọn to bồng bềnh',
            'Tóc đuôi ngựa buộc cao, gọn gàng',
            'Tóc búi cao gọn gàng, thanh lịch',
            'Tóc tết bím lệch vai duyên dáng',
            'Tóc layer nhiều tầng hiện đại',
        ],
    },
    male: {
        'Tóc ngắn': [
            'Tóc húi cua (buzz cut) nam tính',
            'Tóc side part cổ điển, lịch lãm',
            'Tóc vuốt dựng (spiky) hiện đại',
            'Tóc two-block kiểu Hàn Quốc',
            'Tóc Undercut vuốt ngược',
            'Tóc Mohican ngắn',
        ],
        'Tóc dài': [
            'Tóc dài ngang vai, lãng tử',
            'Tóc Man Bun buộc cao gọn gàng',
            'Tóc vuốt ngược (slick back) dài',
            'Tóc dài xoăn nhẹ tự nhiên',
            'Tóc Mullet hiện đại',
        ],
    },
};

const PROMPT_BOILERPLATE = "QUAN TRỌNG: Giữ nguyên tuyệt đối tỷ lệ, vị trí và bố cục của chủ thể. Không được thay đổi kích thước, không dịch chuyển, không làm méo hay biến dạng. Tư thế và dáng đứng của chủ thể phải được giữ nguyên một cách hoàn hảo. Tuyệt đối không làm biến dạng cơ thể, làm méo mặt, kéo dài hoặc nén chủ thể. Ảnh đầu ra phải có tỷ lệ khung hình chính xác như ảnh gốc.";

export const BABY_CONCEPTS = {
    boy: [
        { labelKey: "concept_fashion", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept thời trang tối giản, tông màu đen trắng. Em bé mặc áo sơ mi trắng, quần đen, có thể có nơ hoặc mũ phớt. Phông nền trắng trơn, ánh sáng studio chuyên nghiệp.` },
        { labelKey: "concept_little_boss", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept 'doanh nhân nhí' hài hước, em bé mặc áo sơ mi và cà vạt, bò trên sàn nhà văn phòng với laptop, cặp xách và giấy tờ. Tông màu xanh navy và xám.` },
        { labelKey: "concept_scholar", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept thư sinh cổ trang, em bé mặc áo dài cách tân, ngồi bên bàn gỗ thấp với giấy bút lông và bình phong gỗ. Tông màu trầm ấm, hoài cổ.` },
        { labelKey: "concept_blue_birthday", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept sinh nhật với phông nền màu xanh da trời. Em bé mặc trang phục dự tiệc, đội mũ sinh nhật, có bóng bay, quà và bánh kem. Ánh sáng trong trẻo, vui tươi.` },
        { labelKey: "concept_pilot", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept phi công nhí. Em bé mặc trang phục phi công, đội mũ và kính phi công, ngồi cạnh các mô hình máy bay. Phông nền bầu trời và mây.` },
        { labelKey: "concept_superhero", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept siêu anh hùng. Em bé mặc trang phục siêu nhân, có áo choàng. Phông nền là một thành phố hoạt hình, ánh sáng mạnh mẽ.` },
        { labelKey: "concept_explorer", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept nhà thám hiểm. Em bé mặc đồ safari, đội mũ rộng vành, cầm ống nhòm, xung quanh là cây lá nhiệt đới.` },
        { labelKey: "concept_footballer", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept cầu thủ bóng đá. Em bé mặc đồng phục thể thao, ngồi cạnh quả bóng trên nền cỏ xanh.` },
        { labelKey: "concept_teddy_bear", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept tông màu nâu ấm, em bé mặc bộ romper gấu bông dễ thương, ngồi giữa các chú gấu teddy, ánh sáng dịu nhẹ, ấm cúng.` },
        { labelKey: "concept_brown_birthday", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept sinh nhật tông màu nâu gỗ ấm cúng. Em bé mặc trang phục lịch sự màu be hoặc nâu, ngồi giữa các món đồ chơi bằng gỗ, có bánh kem và cờ treo trang trí. Ánh sáng tự nhiên, dịu nhẹ.` },
        { labelKey: "concept_first_birthday", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept studio tối giản Hàn Quốc cho sinh nhật 1 tuổi. Em bé mặc trang phục màu trắng hoặc be, ngồi trên sàn gỗ. Phông nền trắng trơn, có một quả bóng bay số '1' màu vàng gold, một chiếc bánh kem nhỏ và một vài món đồ chơi gỗ. Ánh sáng tự nhiên, trong trẻo và mềm mại.` },
        { labelKey: "concept_vintage", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept retro, em bé mặc quần yếm và mũ nồi cổ điển, phông nền tường vàng, có TV, quạt cũ. Tông màu phim ấm áp.` },
        { labelKey: "concept_korean_minimal", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio tối giản Hàn Quốc, em bé mặc bộ đồ cotton màu trung tính (be, trắng), phông nền trơn, ít phụ kiện. Ánh sáng dịu nhẹ.` },
        { labelKey: "concept_dinosaur", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept khủng long. Em bé mặc quần yếm, ngồi trong một chiếc xe đẩy gỗ. Phông nền màu cam rực rỡ, xung quanh là các chú khủng long đồ chơi màu xanh lá. Ánh sáng vui tươi.` },
        { labelKey: "concept_investigator", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept nhà điều tra nhí. Em bé mặc đồ kaki, đội mũ, cầm kính lúp. Phông nền là một bàn làm việc với các bản đồ cũ và các vật dụng khám phá. Ánh sáng studio, tông màu vintage.` },
        { labelKey: "concept_safari", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept safari tối giản. Em bé mặc trang phục màu trung tính, ngồi trên ghế sofa hình thú, xung quanh là các con thú nhồi bông như hươu cao cổ, sư tử, ngựa vằn. Phông nền trắng, ánh sáng studio.` },
        { labelKey: "concept_little_room", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept căn phòng ngủ tối giản. Em bé mặc đồ ngủ thoải mái, ngồi trên giường kẻ caro xanh trắng. Phông nền là vách ngăn shoji, có cây xanh trong giỏ mây và các món đồ chơi đơn giản. Ánh sáng tự nhiên.` },
    ],
    girl: [
        { labelKey: "concept_sweet_candy", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept kẹo ngọt vui nhộn. Em bé mặc trang phục sặc sỡ, ngồi giữa các loại kẹo mút, bim bim, bánh kẹo. Phông nền màu đỏ rực rỡ, ánh sáng tươi vui.` },
        { labelKey: "concept_fairy_tale", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept khu vườn cổ tích mơ màng. Em bé mặc trang phục màu trắng hoặc pastel, xung quanh có hoa, bươm bướm và vải voan mềm mại. Tông màu ảnh trong trẻo, dịu dàng.` },
        { labelKey: "concept_white_rabbit", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept thỏ trắng đáng yêu, em bé mặc bộ đồ thỏ bông trắng muốt, ngồi trên sofa hoặc nền mềm mại, xung quanh có bóng bay màu pastel và thỏ nhồi bông. Ánh sáng trong trẻo, nhẹ nhàng.` },
        { labelKey: "concept_tea_party", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept tiệc trà vui nhộn, em bé mặc đồ dễ thương, ngồi trên thảm sặc sỡ bên cạnh một bộ ấm trà và bánh macaron. Phông nền màu xanh dương, có các nhân vật hoạt hình đáng yêu. Không khí tinh nghịch.` },
        { labelKey: "concept_princess", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept công chúa. Em bé mặc một chiếc váy bồng bềnh, có thể đội vương miện nhỏ. Phông nền là một lâu đài cổ tích hoặc khu vườn hoa.` },
        { labelKey: "concept_little_chef", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept đầu bếp. Em bé mặc tạp dề, đội mũ đầu bếp, xung quanh có các dụng cụ làm bếp bằng gỗ và bột mì.` },
        { labelKey: "concept_little_artist", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept họa sĩ. Em bé đội mũ nồi, mặc yếm, ngồi trước giá vẽ với các vệt màu sặc sỡ.` },
        { labelKey: "concept_angel", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept thiên thần. Em bé mặc váy trắng, có đôi cánh nhỏ, ngồi trên những đám mây bông. Ánh sáng mềm mại, huyền ảo.` },
        { labelKey: "concept_teddy_bear", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept tông màu nâu ấm, em bé mặc bộ romper gấu bông dễ thương, ngồi giữa các chú gấu teddy, ánh sáng dịu nhẹ, ấm cúng.` },
        { labelKey: "concept_birthday_party", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept sinh nhật với phông nền pastel, em bé mặc trang phục dự tiệc dễ thương, có bóng bay, bánh kem và chữ Happy Birthday. Ánh sáng trong trẻo, vui tươi.` },
        { labelKey: "concept_first_birthday", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept studio tối giản Hàn Quốc cho sinh nhật 1 tuổi. Em bé mặc trang phục màu trắng hoặc be, ngồi trên sàn gỗ. Phông nền trắng trơn, có một quả bóng bay số '1' màu vàng gold, một chiếc bánh kem nhỏ và một vài món đồ chơi gỗ. Ánh sáng tự nhiên, trong trẻo và mềm mại.` },
        { labelKey: "concept_nature", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept 'khu vườn' trong studio, em bé mặc đồ màu xanh lá hoặc màu be, ngồi giữa hoa lá và rau củ. Ánh sáng tự nhiên.` },
        { labelKey: "concept_korean_minimal", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio tối giản Hàn Quốc, em bé mặc bộ đồ cotton màu trung tính (be, trắng), phông nền trơn, ít phụ kiện. Ánh sáng dịu nhẹ.` },
        { labelKey: "concept_vegetable_garden", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept vườn rau củ quả. Em bé mặc trang phục hình quả cà chua, ngồi trong giỏ mây, xung quanh là rất nhiều loại trái cây và rau củ tươi ngon như dưa hấu, dứa, chuối. Phông nền màu xanh lá nhạt.` },
        { labelKey: "concept_hedgehog", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept hoạt hình vui nhộn. Em bé mặc bộ đồ hình con nhím dễ thương, đội mũ nhím. Phông nền màu pastel với các cây và quả táo hoạt hình. Ánh sáng tươi sáng, vui vẻ.` },
        { labelKey: "concept_safari", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một studio concept safari tối giản. Em bé mặc trang phục màu trung tính, ngồi trên ghế sofa hình thú, xung quanh là các con thú nhồi bông như hươu cao cổ, sư tử, ngựa vằn. Phông nền trắng, ánh sáng studio.` },
        { labelKey: "concept_little_room", prompt: `${PROMPT_BOILERPLATE} Thay thế cảnh và trang phục bằng một concept căn phòng ngủ tối giản. Em bé mặc đồ ngủ thoải mái, ngồi trên giường kẻ caro xanh trắng. Phông nền là vách ngăn shoji, có cây xanh trong giỏ mây và các món đồ chơi đơn giản. Ánh sáng tự nhiên.` },
    ]
};

export interface SuggestionItem {
  promptKey: string;
}
export interface SuggestionSubCategory {
  labelKey: string;
  items: SuggestionItem[];
}
export interface SuggestionCategory {
  labelKey: string;
  key: string;
  subCategories: SuggestionSubCategory[];
}

export const BACKGROUND_PROMPT_SUGGESTIONS: SuggestionCategory[] = [
    {
        labelKey: 'bg_cat_baby',
        key: 'bg_cat_baby',
        subCategories: [
            {
                labelKey: 'bg_subcat_teddy',
                items: [
                    { promptKey: 'bg_prompt_baby_teddy_1' },
                    { promptKey: 'bg_prompt_baby_teddy_2' },
                    { promptKey: 'bg_prompt_baby_teddy_3' },
                    { promptKey: 'bg_prompt_baby_teddy_4' },
                    { promptKey: 'bg_prompt_baby_teddy_5' },
                ],
            },
            {
                labelKey: 'bg_subcat_birthday',
                items: [
                    { promptKey: 'bg_prompt_baby_birthday_1' },
                    { promptKey: 'bg_prompt_baby_birthday_2' },
                    { promptKey: 'bg_prompt_baby_birthday_3' },
                    { promptKey: 'bg_prompt_baby_birthday_4' },
                    { promptKey: 'bg_prompt_baby_birthday_5' },
                ],
            },
            {
                labelKey: 'bg_subcat_nature',
                items: [
                    { promptKey: 'bg_prompt_baby_nature_1' },
                    { promptKey: 'bg_prompt_baby_nature_2' },
                    { promptKey: 'bg_prompt_baby_nature_3' },
                    { promptKey: 'bg_prompt_baby_nature_4' },
                ],
            },
            {
                labelKey: 'bg_subcat_vintage',
                items: [
                    { promptKey: 'bg_prompt_baby_vintage_1' },
                    { promptKey: 'bg_prompt_baby_vintage_2' },
                    { promptKey: 'bg_prompt_baby_vintage_3' },
                    { promptKey: 'bg_prompt_baby_vintage_4' },
                ],
            },
            {
                labelKey: 'bg_subcat_fun',
                items: [
                    { promptKey: 'bg_prompt_baby_fun_1' },
                    { promptKey: 'bg_prompt_baby_fun_2' },
                    { promptKey: 'bg_prompt_baby_fun_3' },
                    { promptKey: 'bg_prompt_baby_fun_4' },
                ],
            },
            {
                labelKey: 'bg_subcat_minimalist',
                items: [
                    { promptKey: 'bg_prompt_baby_minimalist_1' },
                    { promptKey: 'bg_prompt_baby_minimalist_2' },
                    { promptKey: 'bg_prompt_baby_minimalist_3' },
                ],
            },
        ],
    },
    {
        labelKey: 'bg_cat_wedding',
        key: 'bg_cat_wedding',
        subCategories: [
            {
                labelKey: 'bg_subcat_wedding_indoor',
                items: [
                    { promptKey: 'bg_prompt_wedding_indoor_1' }, { promptKey: 'bg_prompt_wedding_indoor_2' },
                    { promptKey: 'bg_prompt_wedding_indoor_3' }, { promptKey: 'bg_prompt_wedding_indoor_4' },
                    { promptKey: 'bg_prompt_wedding_indoor_5' }, { promptKey: 'bg_prompt_wedding_indoor_6' },
                    { promptKey: 'bg_prompt_wedding_indoor_7' }, { promptKey: 'bg_prompt_wedding_indoor_8' },
                    { promptKey: 'bg_prompt_wedding_indoor_9' }, { promptKey: 'bg_prompt_wedding_indoor_10' },
                    { promptKey: 'bg_prompt_wedding_indoor_11' }, { promptKey: 'bg_prompt_wedding_indoor_12' },
                    { promptKey: 'bg_prompt_wedding_indoor_13' }, { promptKey: 'bg_prompt_wedding_indoor_14' },
                    { promptKey: 'bg_prompt_wedding_indoor_15' }, { promptKey: 'bg_prompt_wedding_indoor_16' },
                    { promptKey: 'bg_prompt_wedding_indoor_17' }, { promptKey: 'bg_prompt_wedding_indoor_18' },
                    { promptKey: 'bg_prompt_wedding_indoor_19' }, { promptKey: 'bg_prompt_wedding_indoor_20' },
                    { promptKey: 'bg_prompt_wedding_indoor_21' }, { promptKey: 'bg_prompt_wedding_indoor_22' },
                ],
            },
            {
                labelKey: 'bg_subcat_wedding_outdoor',
                items: [
                    { promptKey: 'bg_prompt_wedding_outdoor_1' }, { promptKey: 'bg_prompt_wedding_outdoor_2' },
                    { promptKey: 'bg_prompt_wedding_outdoor_3' }, { promptKey: 'bg_prompt_wedding_outdoor_4' },
                    { promptKey: 'bg_prompt_wedding_outdoor_5' }, { promptKey: 'bg_prompt_wedding_outdoor_6' },
                    { promptKey: 'bg_prompt_wedding_outdoor_7' }, { promptKey: 'bg_prompt_wedding_outdoor_8' },
                    { promptKey: 'bg_prompt_wedding_outdoor_9' }, { promptKey: 'bg_prompt_wedding_outdoor_10' },
                    { promptKey: 'bg_prompt_wedding_outdoor_11' },
                ],
            },
            {
                labelKey: 'bg_subcat_wedding_beach',
                items: [
                    { promptKey: 'bg_prompt_wedding_beach_1' }, { promptKey: 'bg_prompt_wedding_beach_2' },
                    { promptKey: 'bg_prompt_wedding_beach_3' }, { promptKey: 'bg_prompt_wedding_beach_4' },
                ],
            },
            {
                labelKey: 'bg_subcat_wedding_urban',
                items: [
                    { promptKey: 'bg_prompt_wedding_urban_1' }, { promptKey: 'bg_prompt_wedding_urban_2' },
                    { promptKey: 'bg_prompt_wedding_urban_3' }, { promptKey: 'bg_prompt_wedding_urban_4' },
                    { promptKey: 'bg_prompt_wedding_urban_5' }, { promptKey: 'bg_prompt_wedding_urban_6' },
                    { promptKey: 'bg_prompt_wedding_urban_7' }, { promptKey: 'bg_prompt_wedding_urban_8' },
                    { promptKey: 'bg_prompt_wedding_urban_9' }, { promptKey: 'bg_prompt_wedding_urban_10' },
                ],
            },
        ],
    },
    {
        labelKey: 'bg_cat_fashion',
        key: 'bg_cat_fashion',
        subCategories: [
            {
                labelKey: 'bg_subcat_fashion_indoor',
                items: [
                    { promptKey: 'bg_prompt_fashion_indoor_1' }, { promptKey: 'bg_prompt_fashion_indoor_2' },
                    { promptKey: 'bg_prompt_fashion_indoor_3' }, { promptKey: 'bg_prompt_fashion_indoor_4' },
                ],
            },
            {
                labelKey: 'bg_subcat_fashion_lighting',
                items: [
                    { promptKey: 'bg_prompt_fashion_lighting_1' }, { promptKey: 'bg_prompt_fashion_lighting_2' },
                    { promptKey: 'bg_prompt_fashion_lighting_3' }, { promptKey: 'bg_prompt_fashion_lighting_4' },
                ],
            },
            {
                labelKey: 'bg_subcat_fashion_outdoor',
                items: [
                    { promptKey: 'bg_prompt_fashion_outdoor_1' }, { promptKey: 'bg_prompt_fashion_outdoor_2' },
                    { promptKey: 'bg_prompt_fashion_outdoor_3' }, { promptKey: 'bg_prompt_fashion_outdoor_4' },
                    { promptKey: 'bg_prompt_fashion_outdoor_5' }, { promptKey: 'bg_prompt_fashion_outdoor_6' },
                ],
            },
        ],
    },
];


export const POSING_STUDIO_SUGGESTIONS = {
    female: [
        { labelKey: 'pose_female_arms_akimbo', prompt: 'Một người phụ nữ đứng với tay chống hông, mỉm cười.' },
        { labelKey: 'pose_female_over_shoulder', prompt: 'Một người phụ nữ nhìn qua vai của mình.' },
        { labelKey: 'pose_female_sitting_chair', prompt: 'Một người phụ nữ ngồi thanh lịch trên một chiếc ghế.' },
        { labelKey: 'pose_female_crossed_legs', prompt: 'Một người phụ nữ ngồi trên ghế, vắt chéo chân một cách duyên dáng.' },
        { labelKey: 'pose_female_hand_in_hair', prompt: 'Một người phụ nữ đưa tay lên vuốt nhẹ mái tóc của mình.' },
        { labelKey: 'pose_female_joyful_jump', prompt: 'Một người phụ nữ nhảy lên không trung với biểu cảm vui tươi.' },
        { labelKey: 'pose_female_hands_in_pockets', prompt: 'Một người phụ nữ đứng thẳng, hai tay đút trong túi quần, nhìn thẳng vào máy ảnh.' },
        { labelKey: 'pose_female_leaning_railing', prompt: 'Một người phụ nữ đang dựa vào lan can, nhìn ra xa.' },
        { labelKey: 'pose_female_holding_flowers', prompt: 'Một người phụ nữ đang ôm một bó hoa lớn trước ngực.' },
        { labelKey: 'pose_female_looking_down', prompt: 'Một người phụ nữ đứng nghiêng người, đầu hơi cúi nhìn xuống đất một cách suy tư.' },
        { labelKey: 'pose_female_walking_street', prompt: 'Một người phụ nữ đang bước đi trên một con phố, tóc bay nhẹ trong gió.' },
    ],
    male: [
        { labelKey: 'pose_male_arms_crossed', prompt: 'Một người đàn ông đứng khoanh tay, trông tự tin.' },
        { labelKey: 'pose_male_leaning_wall', prompt: 'Một người đàn ông dựa vào tường một cách thoải mái.' },
        { labelKey: 'pose_male_walking', prompt: 'Một người đàn ông đang bước đi về phía máy ảnh.' },
        { labelKey: 'pose_male_adjusting_tie', prompt: 'Một người đàn ông đang đưa tay lên chỉnh chiếc cà vạt của mình.' },
        { labelKey: 'pose_male_hands_in_pockets', prompt: 'Một người đàn ông đứng đút tay vào túi quần, trông thoải mái.' },
        { labelKey: 'pose_male_sitting_steps', prompt: 'Một người đàn ông ngồi trên bậc thang, khuỷu tay đặt trên đầu gối.' },
        { labelKey: 'pose_male_looking_away', prompt: 'Một người đàn ông đứng nhìn ra xa xăm, vẻ mặt trầm tư.' },
        { labelKey: 'pose_male_leaning_car', prompt: 'Một người đàn ông sành điệu dựa vào một chiếc ô tô cổ điển.' },
        { labelKey: 'pose_male_holding_coffee', prompt: 'Một người đàn ông đang cầm một ly cà phê và bước đi.' },
        { labelKey: 'pose_male_reading_book', prompt: 'Một người đàn ông ngồi trong quán cà phê và đang đọc một cuốn sách.' },
        { labelKey: 'pose_male_leaning_forward', prompt: 'Một người đàn ông đứng nghiêng người, một tay trong túi quần, tay kia cầm áo khoác vắt trên vai.' },
    ],
};

export const POSING_STUDIO_CUSTOM_SUGGESTIONS = [
    'đứng nghiêng người, một tay giơ lên',
    'ngồi trên bậc thang, nhìn xa xăm',
    'nhảy lên không trung với vẻ mặt vui mừng',
];

export const PREDEFINED_TRENDS = {
    'yearbook': {
        labelKey: 'trend_yearbook_90s',
        prompt: 'Tạo một bức ảnh chân dung kỷ yếu phong cách thập niên 90. Người trong ảnh mặc áo len cổ lọ, phông nền màu xanh xám loang lổ. Thêm dòng chữ "{{shop_name}}" ở góc dưới.',
    },
    'barbie': {
        labelKey: 'trend_barbie',
        prompt: 'Biến người trong ảnh thành búp bê Barbie. {{scene_description}}. Trang phục màu hồng, tóc vàng óng ả, phông nền lấp lánh. Thêm logo "{{shop_name}}".',
    },
    'profile_red': {
        labelKey: 'trend_profile_red',
        prompt: 'Create a Vertical portrait shot in 1080x1920 format, characterized by stark cinematic lighting and intense contrast. Captured with a slightly low, upward-facing angle that dramatizes the subject’s jawline and neck, the composition evokes quiet dominance and sculptural elegance. The background is a deep, saturated crimson red, creating a bold visual clash with the model’s luminous skin and dark wardrobe. Lighting is tightly directional, casting warm golden highlights on one side of the face while plunging the other into velvety shadow, emphasizing bone structure with almost architectural precision. wearing smart black suit and black shirt. shooting half top body.',
    },
    'grab_bike': {
        labelKey: 'trend_grab_bike',
        prompt: 'Một chàng trai trẻ mặc áo khoác xanh lá cây đồng phục Grab, logo Grab hiện rõ. Anh đang đi xe đạp thay vì xe máy, trên tay cầm một chiếc máy ảnh. Bối cảnh đường phố đô thị, ban ngày, phong cách chân thực, tự nhiên.',
    },
    'artist': {
        labelKey: 'trend_artist',
        prompt: 'Một chàng trai trẻ mặc áo khoác gió màu nâu nhạt, bên trong là áo phông trắng, quần màu nâu nhạt, đang vẽ tranh chân dung tự họa. Khuôn mặt chàng trai dính một chút sơn, khuôn mặt trong tranh thì không có sơn. Xung quanh có nhiều cọ vẽ và bình hoa, ánh sáng tự nhiên chiếu từ cửa sổ, phong cách ảnh chân thực, góc máy chính diện.',
    },
    'art_exhibition': {
        labelKey: 'trend_art_exhibition',
        prompt: 'Biến ảnh này thành khung cảnh trong phòng triển lãm nghệ thuật. Trên tường treo một bức tranh chân dung sơn dầu khổ lớn vẽ lại chính nhân vật trong ảnh, theo phong cách hội họa đương đại với nét cọ mềm mại, nền trừu tượng và mơ mộng. Chân dung phải giữ nguyên gương mặt thật, đường nét và danh tính, không được biến dạng hay thay đổi. Ở tiền cảnh, hiển thị chính nhân vật đó nhìn từ phía sau, nhưng đứng hơi lệch sang một bên và hơi chếch góc, để toàn bộ bức tranh trên tường được nhìn rõ ràng, không bị che khuất. Toàn cảnh phải sắc nét, chi tiết, rõ ràng, mang không khí tinh tế và nghệ thuật.',
    },
};

export const LIGHTING_STYLES = [
    { name: 'Ánh sáng Rembrandt', prompt: 'Tái tạo ánh sáng bằng kỹ thuật ánh sáng Rembrandt, với một tam giác ánh sáng nhỏ trên má tối hơn.' },
    { name: 'Ánh sáng viền', prompt: 'Thêm một ánh sáng viền mạnh từ phía sau để tách chủ thể khỏi nền.' },
    { name: 'Ánh sáng dịu', prompt: 'Sử dụng ánh sáng dịu, khuếch tán để tạo ra một cái nhìn mềm mại, ít tương phản.' },
];

export const BACKGROUND_LIGHTING_EFFECTS: Record<string, { key: string; labelKey: string }[]> = {
    'lighting_group_hair': [
        { key: 'hair_edge_light', labelKey: 'lighting_effect_hair_edge_light' },
        { key: 'hair_rim_left', labelKey: 'lighting_effect_hair_rim_left' },
        { key: 'hair_rim_right', labelKey: 'lighting_effect_hair_rim_right' },
        { key: 'backlight_left', labelKey: 'lighting_effect_backlight_left' },
        { key: 'backlight_right', labelKey: 'lighting_effect_backlight_right' },
        { key: 'nape_light', labelKey: 'lighting_effect_nape_light' },
        { key: 'back_top_light', labelKey: 'lighting_effect_back_top_light' },
        { key: 'shoulder_left', labelKey: 'lighting_effect_shoulder_left' },
        { key: 'shoulder_right', labelKey: 'lighting_effect_shoulder_right' },
        { key: 'collarline_light', labelKey: 'lighting_effect_collarline_light' },
    ],
    'lighting_group_back': [
        { key: 'spine_light', labelKey: 'lighting_effect_spine_light' },
        { key: 'waist_rim', labelKey: 'lighting_effect_waist_rim' },
        { key: 'hip_rim_left', labelKey: 'lighting_effect_hip_rim_left' },
        { key: 'hip_rim_right', labelKey: 'lighting_effect_hip_rim_right' },
    ],
    'lighting_group_hands': [
        { key: 'hand_flower_light', labelKey: 'lighting_effect_hand_flower_light' },
        { key: 'ring_light', labelKey: 'lighting_effect_ring_light' },
        { key: 'wrist_light', labelKey: 'lighting_effect_wrist_light' },
        { key: 'lapel_light', labelKey: 'lighting_effect_lapel_light' },
        { key: 'tie_light', labelKey: 'lighting_effect_tie_light' },
    ],
    'lighting_group_dress': [
        { key: 'dress_streak_diagonal', labelKey: 'lighting_effect_dress_streak_diagonal' },
        { key: 'dress_lace_light', labelKey: 'lighting_effect_dress_lace_light' },
        { key: 'dress_fold_light', labelKey: 'lighting_effect_dress_fold_light' },
        { key: 'dress_hem_light', labelKey: 'lighting_effect_dress_hem_light' },
        { key: 'dress_trail_light', labelKey: 'lighting_effect_dress_trail_light' },
        { key: 'veil_back_light', labelKey: 'lighting_effect_veil_back_light' },
        { key: 'veil_through_light', labelKey: 'lighting_effect_veil_through_light' },
    ],
    'lighting_group_env': [
        { key: 'floor_streak_front', labelKey: 'lighting_effect_floor_streak_front' },
        { key: 'floor_streak_back', labelKey: 'lighting_effect_floor_streak_back' },
        { key: 'window_streak_bg', labelKey: 'lighting_effect_window_streak_bg' },
        { key: 'streak_horizontal', labelKey: 'lighting_effect_streak_horizontal' },
        { key: 'streak_vertical', labelKey: 'lighting_effect_streak_vertical' },
        { key: 'blinds_effect_bg', labelKey: 'lighting_effect_blinds_effect_bg' },
        { key: 'spotlight_on_subject', labelKey: 'lighting_effect_spotlight_on_subject' },
        { key: 'foliage_gobo', labelKey: 'lighting_effect_foliage_gobo' },
        { key: 'bokeh_lights_back', labelKey: 'lighting_effect_bokeh_lights_back' },
        { key: 'soft_halo_back', labelKey: 'lighting_effect_soft_halo_back' },
        { key: 'full_body_silhouette', labelKey: 'lighting_effect_full_body_silhouette' },
        { key: 'kicker_left', labelKey: 'lighting_effect_kicker_left' },
        { key: 'kicker_right', labelKey: 'lighting_effect_kicker_right' },
    ],
};