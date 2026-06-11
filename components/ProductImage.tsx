type ProductImageProps = {
  className?: string;
  position?: string;
  source?: "store" | "deer";
};

export function ProductImage({ className = "", position = "50% 50%", source = "store" }: ProductImageProps) {
  const image = source === "deer" ? "/images/christmas-deer-results.jpeg" : "/images/yiwu-christmas-store.jpeg";

  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{
        backgroundImage: `url(${image})`,
        backgroundPosition: position
      }}
    />
  );
}
