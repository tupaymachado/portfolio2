
// Pega a URL base do Vite (ex: "/" ou "/portfolio2/")
const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export interface Track {
    url: string;
    metaData: {
        artist: string;
        title: string;
    };
    duration?: number;
}

export const INITIAL_PLAYLIST: Track[] = [
    {
        metaData: { artist: 'DJ Mike Llama', title: "Llama Whippin' Intro" },
        url: 'https://cdn.webamp.org/llama-2.91.mp3',
        duration: 5.322286,
    },
    {
        metaData: { artist: 'CPM22', title: 'Um Minuto Para o Fim do Mundo' },
        url: `${BASE_URL}/music/CPM22 - Um Minuto Para o Fim do Mundo.ogg`,
    },
    {
        metaData: { artist: 'Akon', title: 'Dont Matter' },
        url: `${BASE_URL}/music/Akon - Dont Matter.ogg`,
    },
    {
        metaData: { artist: 'Rihanna', title: 'Umbrella' },
        url: `${BASE_URL}/music/Rihanna - Umbrella.ogg`,
    },
    {
        metaData: { artist: 'Rihanna', title: 'Dont Stop The Music' },
        url: `${BASE_URL}/music/Rihanna - Dont Stop The Music.ogg`,
    },
    {
        metaData: { artist: 'Seu Jorge', title: 'Mina de Condominio' },
        url: `${BASE_URL}/music/Seu Jorge - Mina de Condominio.ogg`,
    },
    {
        metaData: { artist: 'Vanessa da Mata', title: 'Boa Sorte' },
        url: `${BASE_URL}/music/Vanessa da Mata - Boa Sorte.ogg`,
    },
    {
        metaData: { artist: 'Beethoven', title: 'Symphony No. 9 (Scherzo)' },
        url: `${BASE_URL}/music/Beethoven's Symphony No. 9 (Scherzo).ogg`,
    },
];
