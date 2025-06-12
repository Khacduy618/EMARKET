// app/seasonalThemes.ts
export interface SeasonTheme {
    name: string;
    navClass: string;
    itemClass: {
        base: string; hover: string; scrolled: string; scrolledHover: string;
    };
}
export const themes: { [key: number]: SeasonTheme } = {
    1: { name: 'spring', navClass: 'bg-gradient-to-b from-pink-500 to-pink-400', itemClass: { base: 'text-white', hover: 'hover:bg-pink-600/80', scrolled: 'text-black', scrolledHover: 'hover:bg-pink-200' } },
    2: { name: 'summer', navClass: 'bg-gradient-to-b from-orange-500 to-orange-400', itemClass: { base: 'text-white', hover: 'hover:bg-orange-600/80', scrolled: 'text-black', scrolledHover: 'hover:bg-orange-200' } },
    3: { name: 'autumn', navClass: 'bg-gradient-to-b from-red-600 to-amber-500', itemClass: { base: 'text-white', hover: 'hover:bg-red-700/80', scrolled: 'text-black', scrolledHover: 'hover:bg-amber-200' } },
    4: { name: 'winter', navClass: 'bg-gradient-to-b from-blue-600 to-sky-500', itemClass: { base: 'text-white', hover: 'hover:bg-blue-700/80', scrolled: 'text-yellow-200', scrolledHover: 'hover:bg-sky-300' } },
};
export const getActiveSeasonTheme = (): SeasonTheme => {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 3) return themes[1];
    if (month >= 4 && month <= 6) return themes[2]; // Tháng 6 -> Mùa 2 -> Màu cam
    if (month >= 7 && month <= 9) return themes[3];
    return themes[4];
};