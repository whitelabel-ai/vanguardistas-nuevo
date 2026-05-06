interface DataLayerItem {
  event?: string;
  [key: string]: unknown;
}

interface Window {
  dataLayer: DataLayerItem[];
}
