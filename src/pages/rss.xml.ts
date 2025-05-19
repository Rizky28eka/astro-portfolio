import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { SITE } from "@consts"

type Context = {
  site: string
}

export async function GET(context: Context) {
  const posts = await getCollection("blog")
  const projects = await getCollection("projects")
  const items = [...posts, ...projects]
  
  // Filter out items without dates and sort
  const itemsWithDates = items.filter(item => item.data.date)
  itemsWithDates.sort((a, b) => {
    const dateA = new Date(a.data.date!).getTime()
    const dateB = new Date(b.data.date!).getTime()
    return dateB - dateA
  })
  
  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site,
    items: itemsWithDates.map((item) => ({
      title: item.data.title,
      description: item.data.summary || "", // Provide fallback for undefined summary
      pubDate: new Date(item.data.date!), // Convert to Date object
      link: item.slug.startsWith("blog")
        ? `/blog/${item.slug}/`
        : `/projects/${item.slug}/`,
    })),
  })
}