// CATALOG//NET para Nuvio: enlaces de Yandex Disk resueltos en este dispositivo.
var BASE = "https://victory-incl-elephant-diesel.trycloudflare.com";
var YANDEX_API = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=";
var MAX_LINKS = 12;

function resolveYandex(share) {
  return fetch(YANDEX_API + encodeURIComponent(share))
    .then(function (r) { return r.json(); })
    .then(function (j) { return j && j.href ? j.href : null; })
    .catch(function () { return null; });
}

function getStreams(tmdbId, mediaType, season, episode) {
  var type = mediaType === "movie" ? "movie" : "tv";
  // Nuvio pasa el número de TMDB; por si llega con prefijo ("series:1399"), se queda con el número.
  var id = String(tmdbId).split(":").filter(function (p) { return /^\d+$/.test(p); })[0] || String(tmdbId);
  var url = BASE + "/addon/links/" + type + "/" + encodeURIComponent(id) + ".json";
  if (type === "tv") url += "?s=" + (season || 1) + "&e=" + (episode || 1);
  return fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (links) {
      return Promise.all((links || []).slice(0, MAX_LINKS).map(function (l) {
        return resolveYandex(l.share).then(function (href) {
          if (!href) return null; // p. ej. límite de descargas de Yandex superado
          return {
            name: "CATALOG//NET " + l.quality,
            title: l.title + (l.langs.length ? "\n" + l.langs.join(" · ") : ""),
            url: href,
            quality: l.quality,
            size: l.size || undefined,
            language: l.langs.join(", ") || undefined,
            provider: "Yandex Disk",
            type: "direct"
          };
        });
      }));
    })
    .then(function (streams) { return streams.filter(Boolean); })
    .catch(function () { return []; });
}

module.exports = { getStreams: getStreams };