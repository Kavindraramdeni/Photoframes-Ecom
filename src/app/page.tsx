import { Hero } from "@/components/storefront/hero";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { WhyChooseUs } from "@/components/storefront/why-choose-us";
import { CustomerGallery, Testimonials } from "@/components/storefront/social-proof";
import { InstagramFeed } from "@/components/storefront/instagram-feed";
import { Faq } from "@/components/storefront/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyChooseUs />
      <CustomerGallery />
      <Testimonials />
      <InstagramFeed />
      <Faq />
    </>
  );
}
