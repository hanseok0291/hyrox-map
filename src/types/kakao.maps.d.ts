/** Minimal types for Kakao Maps JavaScript API */
declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  class InfoWindow {
    constructor(options: { content?: string | HTMLElement; removable?: boolean });
    setContent(content: string | HTMLElement): void;
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
  }

  interface MarkerOptions {
    map?: Map;
    position: LatLng;
    title?: string;
    clickable?: boolean;
  }

  interface MarkerClustererOptions {
    map: Map;
    markers: Marker[];
    gridSize?: number;
    minLevel?: number;
  }

  class MarkerClusterer {
    constructor(options: MarkerClustererOptions);
    addMarkers(markers: Marker[]): void;
    clear(): void;
  }

  namespace event {
    function addListener(
      target: Marker,
      type: string,
      handler: () => void
    ): void;
  }

  function load(callback: () => void): void;
}

interface KakaoNamespace {
  maps: typeof kakao.maps;
}

interface Window {
  kakao?: KakaoNamespace;
}
