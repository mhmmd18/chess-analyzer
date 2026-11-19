// Serverless Function untuk Vercel: Proxy API Chess.com dengan User-Agent Resmi
// Ini menyelesaikan masalah Cloudflare 403 saat diakses dari Browser HP / Desktop

module.exports = async (req, res) => {
  // Izinkan CORS agar bisa dipanggil dari web mana pun
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  const cleanUser = encodeURIComponent(username.trim().toLowerCase());
  const customHeaders = {
    'User-Agent': 'ChessMasterApp/1.0 (Web Chess Reviewer; contact: developer@chess-analyzer.app)',
    'Accept': 'application/json'
  };

  try {
    // 1. Ambil daftar arsip game user
    const archivesRes = await fetch(`https://api.chess.com/pub/player/${cleanUser}/games/archives`, {
      headers: customHeaders
    });

    if (archivesRes.status === 404) {
      return res.status(404).json({ error: 'Pengguna Chess.com tidak ditemukan' });
    }
    if (!archivesRes.ok) {
      return res.status(archivesRes.status).json({ error: `Gagal mengakses arsip Chess.com (HTTP ${archivesRes.status})` });
    }

    const archivesData = await archivesRes.json();
    if (!archivesData.archives || archivesData.archives.length === 0) {
      return res.status(404).json({ error: 'Belum ada riwayat permainan untuk akun ini' });
    }

    // 2. Ambil bulan arsip paling akhir
    const lastArchiveUrl = archivesData.archives[archivesData.archives.length - 1];
    const gamesRes = await fetch(lastArchiveUrl, {
      headers: customHeaders
    });

    if (!gamesRes.ok) {
      return res.status(gamesRes.status).json({ error: `Gagal memuat game bulan terakhir (HTTP ${gamesRes.status})` });
    }

    const gamesData = await gamesRes.json();
    if (!gamesData.games || gamesData.games.length === 0) {
      return res.status(404).json({ error: 'Tidak ada game yang ditemukan di bulan terbaru' });
    }

    // 3. Ambil game paling baru
    const lastGame = gamesData.games[gamesData.games.length - 1];
    if (!lastGame.pgn) {
      return res.status(404).json({ error: 'Data PGN untuk game ini tidak tersedia' });
    }

    return res.status(200).json({
      success: true,
      pgn: lastGame.pgn,
      url: lastGame.url,
      white: lastGame.white,
      black: lastGame.black,
      time_class: lastGame.time_class,
      end_time: lastGame.end_time
    });

  } catch (err) {
    console.error('Error fetching chess game:', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
};

