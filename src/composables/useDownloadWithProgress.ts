import { readonly, ref } from "vue";

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}

export function useDownloadWithProgress() {
  const isDownloading = ref(false);
  const downloadProgress = ref<number | null>(null);
  const error = ref<string | null>(null);
  let abortController: AbortController | null = null;

  async function startDownload(url: string, token?: string, clientVersion?: string, filename: string = "") {
    isDownloading.value = true;
    downloadProgress.value = 0;
    error.value = null;
    abortController = new AbortController();

    try {
      const headers = new Headers();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }
      if (clientVersion) {
        headers.append("X-API-Version", clientVersion);
      }

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
        signal: abortController.signal, // Signal an fetch übergeben
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get("Content-Length");
      if (!contentLength) {
        console.warn("Content-Length Header missing. Progress indicator not posible. Fallback to direct blobl-download.");
        const blob = await response.blob();
        const effectiveFilename = filename || url.substring(url.lastIndexOf("/") + 1) || "downloaded-file";
        triggerDownload(blob, effectiveFilename);
        return;
      }

      const totalLength = parseInt(contentLength, 10);
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];
      const reader = response.body!.getReader();

      while (true) {
        if (abortController.signal.aborted) {
          await reader.cancel("Download canceled by user");
          error.value = "Download canceled by user";
          throw new DOMException("Download canceled by user", "AbortError");
        }

        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;
        downloadProgress.value = Math.round((receivedLength / totalLength) * 100);
      }

      // Nur ausführen, wenn nicht abgebrochen
      if (!abortController.signal.aborted) {
        const blob = new Blob(chunks);
        const effectiveFilename = filename || url.substring(url.lastIndexOf("/") + 1) || "downloaded-file";
        triggerDownload(blob, effectiveFilename);
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        if (!error.value) {
          error.value = "Download aborted";
        }
      } else {
        console.error("Download fehlgeschlagen:", e);
        error.value = e.message || "File could not be downloaded";
      }
    } finally {
      isDownloading.value = false;
      // downloadProgress.value = null; // Optional reset
      abortController = null; // Controller reset
    }
  }

  function cancelDownload() {
    if (abortController) {
      abortController.abort();
      console.log("Download-Abbruch angefordert.");
    }
  }

  return {
    isDownloading: readonly(isDownloading),
    downloadProgress: readonly(downloadProgress),
    error: readonly(error),
    startDownload,
    cancelDownload,
  };
}
