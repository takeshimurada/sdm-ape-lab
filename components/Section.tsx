
import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  title: string;
  subtitle: string;
  content: string;
  reverse?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, subtitle, content, reverse }) => {
  return (
    <section className="py-32 px-6 md:px-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
      <div className={`w-full md:w-1/2 ${reverse ? 'md:order-last' : ''}`}>
        <motion.div
          initial={{ opacity: 0, x: reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4"
        >
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">{subtitle}</p>
          <h2 className="text-4xl md:text-5xl font-black">{title}</h2>
          <p className="text-gray-400 text-lg leading-relaxed mt-4">{content}</p>
          <div className="mt-8">
            <button className="text-white font-bold underline decoration-indigo-500 decoration-2 underline-offset-8 hover:text-indigo-400 transition-colors">
              Discover More
            </button>
          </div>
        </motion.div>
      </div>
      
      <div className="w-full md:w-1/2 aspect-square md:aspect-video bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
         <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <div className="w-16 h-16 bg-white/5 rounded-full backdrop-blur-sm"></div>
         </div>
      </div>
    </section>
  );
};

export default Section;
