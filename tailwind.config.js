module.exports = {
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.red.500'),
              '&:hover': {
                color: theme('colors.red.700'),
              },
            },
          },
        },
      }),
      colors: {
        'nyt-black': '#333',
        'nyt-red': '#a81817',
      },
      fontFamily: {
        sans: ['Georgia', 'Cambria', "Times New Roman", 'Times', 'serif'],
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
