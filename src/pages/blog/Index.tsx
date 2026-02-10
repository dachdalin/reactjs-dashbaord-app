import { useState } from "react";
import { blogs } from "../../lib/data";

const categories = [
  "All",
  "React",
  "TypeScript",
  "CSS",
  "Backend",
  "DevOps",
  "Trends",
];

export default function Blogs() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      activeCategory === "All" || blog.category === activeCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredBlog = filteredBlogs.find((b) => b.featured);
  const regularBlogs = filteredBlogs.filter((b) => !b.featured);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog</h1>
          <p className="text-gray-400 mt-1">
            Read the latest articles and updates from our team.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Post
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {activeCategory === "All" && !searchQuery && featuredBlog && (
        <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto overflow-hidden">
              <img
                src={featuredBlog.image}
                alt={featuredBlog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent lg:bg-linear-to-r" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white bg-linear-to-r from-indigo-600 to-purple-600 shadow-lg">
                Featured
              </span>
            </div>
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <span
                className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-semibold text-white bg-linear-to-r ${featuredBlog.categoryColor} mb-4`}
              >
                {featuredBlog.category}
              </span>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {featuredBlog.title}
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {featuredBlog.excerpt}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {featuredBlog.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {featuredBlog.author}
                  </p>
                  <p className="text-xs text-gray-400">
                    {featuredBlog.date} · {featuredBlog.readTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeCategory === "All" && !searchQuery
            ? regularBlogs
            : filteredBlogs
          ).map((blog) => (
            <article
              key={blog.id}
              className="group rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent" />
                <span
                  className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-linear-to-r ${blog.categoryColor}`}
                >
                  {blog.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                  {blog.excerpt}
                </p>

                {/* Author & Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {blog.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {blog.author}
                      </p>
                      <p className="text-xs text-gray-500">{blog.date}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{blog.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/5 border border-white/10">
          <svg
            className="h-16 w-16 text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <p className="text-gray-400 text-lg font-medium">No articles found</p>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}
