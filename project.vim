set path=,,src/**,include/**

" build
nnoremap <Leader>b :!node make.mjs<CR>
nnoremap <Leader>d :!open -a "Google Chrome" chrome://inspect && node --inspect-brk make.mjs<CR>
nnoremap <Leader>c :!rm -rf build<CR>

augroup msgstream
	autocmd!
	autocmd BufNewFile *.c,*.h,*.cpp,*.hpp :0r <sfile>:h/vim/template/skeleton.c
augroup END
