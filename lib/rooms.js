import { supabase } from './supabase.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const genCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

export async function createRoom({ name, rodizioPrice, menu = 'rodizio' }) {
  // retry on the rare code collision
  for (let i = 0; i < 5; i++) {
    const code = genCode();
    const { data, error } = await supabase
      .from('rooms')
      .insert({ code, name, rodizio_price: rodizioPrice, menu })
      .select().single();
    if (!error) return data;
    if (error.code !== '23505') throw error; // not a unique violation
  }
  throw new Error('could not allocate room code');
}

export async function getRoomByCode(code) {
  const { data } = await supabase
    .from('rooms').select('*').ilike('code', code).maybeSingle();
  return data ?? null;
}

export async function joinRoom({ code, name }) {
  const room = await getRoomByCode(code);
  if (!room) throw new Error('sala não encontrada');
  const { data: player, error } = await supabase
    .from('players').insert({ room_id: room.id, name }).select().single();
  if (error) throw error;
  return { room, player };
}
