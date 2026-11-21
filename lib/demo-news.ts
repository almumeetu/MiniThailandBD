import type { News } from "@/lib/admin-api";

/** Editorial guides available alongside articles published through the journal. */
export const DEMO_NEWS: News[] = [
  {
    id: "demo-story-everyday-shopping",
    title: "5 practical checks to make before ordering online",
    slug: "smarter-everyday-shopping",
    excerpt: "From sizing and delivery costs to returns, a few quick checks can help you shop with confidence.",
    content: `Online shopping is convenient, but it is easy to focus on the picture and price and miss details that matter. Before placing your next order, take a few minutes to check what you are buying and how it will reach you.

## Start with what you actually need

Write down the size, quantity and features you are looking for. If you are buying a gift or replacing something at home, check the measurements or model number first. A short list makes it easier to compare products without filling your cart with extras.

## Read the product details

Look at the full description, not just the main image. Check the material, dimensions, pack size and what is included. For clothing and footwear, compare your measurements with the size guide rather than relying on a familiar size label alone.

## Compare the complete cost

A lower product price does not always mean a lower order total. Review the delivery charge and any discount at checkout, and make sure the quantity in your cart is correct before you pay or confirm the order.

## Check delivery and returns

Confirm your phone number and delivery address, including a useful landmark if needed. Read the store’s delivery and return information so you know how to get help if the wrong item arrives or a product is damaged.

## Keep your order details

Save the order number or confirmation message. It makes it easier to track your purchase and explain the issue if you need to contact customer support. These small habits can save time long after you click the order button.`,
    coverImageUrl: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&auto=format&fit=crop&q=85",
    author: "MiniThailandBD Editorial Team", isPublished: true,
    publishedAt: "2026-10-02T08:30:00.000Z", createdAt: "2026-10-02T08:30:00.000Z", updatedAt: "2026-10-02T08:30:00.000Z",
  },
  {
    id: "demo-story-simple-skincare",
    title: "How to build a simple skincare routine",
    slug: "simple-skincare-routine-guide",
    excerpt: "A straightforward guide to choosing the basics and introducing new products at your own pace.",
    content: `A skincare routine does not have to fill an entire shelf. Starting with a few products you understand can make it easier to keep up with daily care and notice how your skin responds.

## Begin with the basics

Many people start with a gentle cleanser and a moisturiser that feels comfortable on their skin. For daytime sun protection, choose a sunscreen and follow the directions on its label. Your preferences, skin type and daily routine can all influence what works for you.

## Read the label before buying

Check the ingredients, product size, expiry information and directions. If you already know that a particular ingredient irritates your skin, look for it on the label before purchasing. A popular product is not necessarily the right choice for everyone.

## Introduce one new product at a time

Adding several products at once makes it harder to tell which one suits you. Introduce new products gradually, follow their instructions and stop using anything that causes irritation. Keep the routine simple enough that you can use it consistently.

## Ask for help when you need it

If you have a persistent skin concern, allergies or questions about a treatment, speak with a qualified healthcare professional. They can help you make decisions based on your individual needs.

The goal is not to follow every trend. Choose products thoughtfully, pay attention to how your skin feels and adjust your routine when necessary.`,
    coverImageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200&auto=format&fit=crop&q=85",
    author: "MiniThailandBD Editorial Team", isPublished: true,
    publishedAt: "2026-09-18T08:30:00.000Z", createdAt: "2026-09-18T08:30:00.000Z", updatedAt: "2026-09-18T08:30:00.000Z",
  },
  {
    id: "demo-story-home-tech",
    title: "What to check before buying everyday tech accessories",
    slug: "useful-home-tech-upgrades",
    excerpt: "Choose chargers, headphones and other accessories with your devices and daily routine in mind.",
    content: `A useful tech accessory should solve a real problem, whether that means charging your phone at your desk or making your daily commute more comfortable. Before comparing features, think about where and how you will use it.

## Check compatibility first

For chargers and cables, look at the connector type and the manufacturer’s compatibility information. Check the charging specifications for both the accessory and your device. If the listing is unclear, ask for the details before ordering.

## Think about everyday use

Headphones for a quiet home office may have different requirements from a pair you carry on a crowded commute. Consider fit, connection type, portability and the features you will actually use. For a desk accessory, measure the space where you intend to keep it.

## Look beyond the headline price

Read what is included in the box and check the warranty or support information where applicable. Compare products on the details that matter to you instead of paying extra for features you do not need.

## Start with one improvement

You do not need to replace your whole setup at once. Choose the accessory that addresses your biggest daily frustration, try it in your routine and decide what else you need later. A considered purchase is often the one you continue to use.`,
    coverImageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&auto=format&fit=crop&q=85",
    author: "MiniThailandBD Editorial Team", isPublished: true,
    publishedAt: "2026-09-04T08:30:00.000Z", createdAt: "2026-09-04T08:30:00.000Z", updatedAt: "2026-09-04T08:30:00.000Z",
  },
];

/** Keep managed articles and add guides that do not share a published slug. */
export function withEditorialGuides(articles: News[]): News[] {
  const slugs = new Set(articles.map((article) => article.slug));
  return [...articles, ...DEMO_NEWS.filter((article) => !slugs.has(article.slug))]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}
