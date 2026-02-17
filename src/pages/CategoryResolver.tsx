import { useParams } from "react-router-dom";
import { CatalogPage } from "./CatalogPage";

export function CategoryResolver() {
  const { slug } = useParams();
  
  // Non-blocking catch-all: Render CatalogPage immediately.
  // CatalogPage will handle resolving the slug while showing skeletons.
  return <CatalogPage categorySlug={slug} />;
}
