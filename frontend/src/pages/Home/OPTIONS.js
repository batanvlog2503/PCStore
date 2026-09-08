export const ADS_SET_A = ["/quangcao1.png", "/quangcao2.png"]

export const ADS_SET_B = ["/quangcao3.png", "/quangcao4.png"]

// ================= THỂ LOẠI =================

export const USE_CASE_TABS = [
  {
    value: "",
    label: "Tất cả",
    icon: "fa-solid fa-laptop",
  },
  {
    value: "gaming",
    label: "Gaming",
    icon: "fa-solid fa-computer",
  },
  {
    value: "office",
    label: "Office",
    icon: "fa-solid fa-display",
  },
  {
    value: "design",
    label: "Design",
    icon: "fa-solid fa-house-laptop",
  },
  {
    value: "ultrabook",
    label: "Ultrabook",
    icon: "fa-solid fa-wrench",
  },
]

// ================= SẮP XẾP =================

export const SORT_OPTIONS = [
  {
    value: "popular",
    label: "Phổ biến",
    icon: "fa-regular fa-star",
  },
  {
    value: "hot",
    label: "Khuyến mại HOT",
    icon: "fa-solid fa-ticket",
  },
  {
    value: "price_asc",
    label: "Giá Thấp - Cao",
    icon: "fa-solid fa-arrow-up-short-wide",
  },
  {
    value: "price_desc",
    label: "Giá Cao - Thấp",
    icon: "fa-solid fa-arrow-down-wide-short",
  },
]

// ================= GIÁ =================

export const PRICE_OPTIONS = [
  {
    value: "",
    label: "Tất cả mức giá",
  },
  {
    value: "0-10000000",
    label: "Dưới 10 triệu",
  },
  {
    value: "10000000-20000000",
    label: "10 - 20 triệu",
  },
  {
    value: "20000000-30000000",
    label: "20 - 30 triệu",
  },
  {
    value: "30000000-",
    label: "Trên 30 triệu",
  },
]

// ================= CPU =================

export const CPU_OPTIONS = [
  "Intel Core i3",
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
]

// ================= RAM =================

export const RAM_OPTIONS = ["8", "16", "32", "64"]

// ================= Ổ CỨNG =================

export const STORAGE_OPTIONS = ["256", "512", "1024", "2048"]

// ================= ĐỘ PHÂN GIẢI =================

export const RESOLUTION_OPTIONS = ["HD", "Full HD", "2K", "4K"]

// ================= GPU =================

export const GPU_OPTIONS = [
  "RTX 3050",
  "RTX 4050",
  "RTX 4060",
  "RTX 4070",
  "Onboard",
]

// ================= KÍCH THƯỚC MÀN HÌNH =================

export const SCREEN_SIZE_OPTIONS = ["13", "14", "15.6", "17"]

// ================= TIÊU CHÍ LỌC =================

export const CRITERIA_TABS = [
  {
    key: "price",
    label: "Xem theo giá",
    type: "select",
    options: PRICE_OPTIONS,
  },
  {
    key: "cpu",
    label: "CPU",
    type: "list",
    options: CPU_OPTIONS,
  },
  {
    key: "ram",
    label: "Dung lượng Ram",
    type: "list",
    options: RAM_OPTIONS,
    suffix: "GB",
  },
  {
    key: "storageCapacity",
    label: "Ổ cứng",
    type: "list",
    options: STORAGE_OPTIONS,
    suffix: "GB",
  },
  {
    key: "resolution",
    label: "Độ phân giải",
    type: "list",
    options: RESOLUTION_OPTIONS,
  },
  {
    key: "gpu",
    label: "Card đồ họa",
    type: "list",
    options: GPU_OPTIONS,
  },
  {
    key: "screenSize",
    label: "Kích thước màn hình",
    type: "list",
    options: SCREEN_SIZE_OPTIONS,
    suffix: '"',
  },
]
