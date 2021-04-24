const express = require('express')
const router = express.Router()
const path = require('path')
const mongoose = require('mongoose')

require('../models/admin')
const Admin = mongoose.model('admins')

require('../models/posts')
const Post = mongoose.model('posts')

require('../models/podcastPosts')
const Podcast = mongoose.model('podcasts')

const bcrypt = require('bcryptjs')
const passport = require('passport')
const { eUser } = require("../helpers/eUser");


router.get('/registro', eUser,  function(req, res){
    res.render('admin/registro')
})

router.post('/registro', eUser, function(req, res){
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido."})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email inválido."})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida."})
    }

    if(req.body.senha.lenght < 8){
        erros.push({texto: "Senha muito curta, mínimo de 8 caracteres."})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas não batem."})
    }

    if(erros.length > 0){
        res.render('admin/registro', {erros: erros})

    }else{

        Admin.findOne({email: req.body.email}).then(function(admin){
            if(admin){
                req.flash("error_msg", "Já existe uma conta com esse email")
                res.redirect('/start/registro')
            }else{
                const novoAdmin = new Admin({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoAdmin.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento.')
                            res.redirect('/start/registro')
                        }

                        novoAdmin.senha = hash

                        novoAdmin.save().then(function(){
                            req.flash('success_msg', 'Usuário criado com sucesso!')
                            res.redirect('/admin/login')
                        }).catch(function(err){
                            req.flash('error_msg', 'Houve um erro ao criar usuário, tente novamente.')
                            res.redirect('/admin/registro')
                        })
                    })
                })
            }
        }).catch(function(err){
            req.flash('error_msg', "Houve um erro interno.")
            res.redirect('/')
        })
    }
})


router.get('/login', function(req, res){
    res.render('admin/login')
})

router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect: '/admin/painel',
        failureRedirect: '/admin/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', eUser, function(req, res){
    req.logout()
    req.flash('success_msg', 'Deslogado com sucesso.')
    res.redirect('/')
})

router.get('/publicar', eUser, function(req, res){
    res.render('admin/publicar')
})

router.post('/publicar', eUser, function(req, res){
    var erros = [];

    if(!req.body.editor || typeof req.body.editor == undefined || req.body.editor == null){
        erros.push({texto: 'POst inválido.'})
    }

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'POst inválido.'})
    }

    if(erros.legth > 0){
        res.render('admin/publicar', {erros: erros})
    }else{
        const novoPost = {
            conteudo: req.body.editor,
            autor: req.user.nome,
            titulo: req.body.titulo,
            data: req.body.data,
            thumb: req.body.thumb,
        };

        new Post(novoPost).save().then(function(){
            req.flash('success_msg', 'Postado!');
            res.redirect('/admin/painel');
        }).catch(function(){
            req.flash('error_msg', 'Houve um erro.');
            res.redirect('/admin/publicar');
        })
    }
})

router.get('/painel', eUser, function (req, res) {
        Post.find({ autor: req.user.nome }).sort({_id: -1}).lean().then(function (posts) {
            res.render('admin/posts', { posts: posts })
        })
    })

router.get('/editarperfil', eUser, function(req, res){
    Admin.findOne({nome: req.user.nome}).then(function(admin){
        res.render('admin/editarperfil', {admin: admin})
    })
})

router.post('/editarperfil', eUser, function(req, res){
    Admin.findOne({nome: req.user.nome}).then(function(admin){

        admin.nome = req.body.nome
        admin.email = req.body.email

        admin.save().lean().then(function(){
            req.flash('success_msg', 'Perfil editado com sucesso.')
            res.redirect('/admin/painel')
        }).catch(function(err){
            req.flash('error_msg', 'Erro interno.')
            res.redirect('/admin/editarperfil')
        })
    }).catch(function(err){
        req.flash('error_msg', 'Houvr um erro ao salvar edição.')
        res.redirect('/admin/editarperfil')
    })
})

router.get('/editarpost/:id', eUser, function(req, res){
    Post.findOne({_id: req.params.id}).lean().then(function(posts){
        res.render('admin/editarpost', {posts: posts})
    }).catch(function(err){
        req.flash('error_msg', 'Houve algum erro.')
        res.redirect('/admin/painel')
    })
})

router.get('/excluirpost/:id', eUser, function(req, res){
    Post.remove({_id: req.params.id}).lean().then(function(){
        req.flash('success_msg', 'Deletado com sucesso.')
        res.redirect('/admin/painel')
    }).catch(function(err){
        req.flash('error_msg', 'Houve um erro ao deletar.')
        res.redirect('/admin/painel')
    })
})

router.post("/post/edit", eUser, function (req, res) {
    Post.findOne({ _id: req.body.id })
      .then(function (posts) {
        posts.titulo = req.body.title;
        posts.conteudo = req.body.coment;
        posts.thumb = req.body.thumb;
        posts.data = req.body.data;
  
        posts
          .save()
          .lean()
          .then(function () {
            req.flash("success_msg", "Perfil editado com sucesso.");
            res.redirect("/admin/painel");
          })
          .catch(function (err) {
            req.flash("error_msg", "Erro interno.");
            res.redirect("/admin/painel");
          });
      })
      .catch(function (err) {
        req.flash("error_msg", "Houve um erro ao salvar a edição.");
        res.redirect("/admin/painel");
      });
  });

router.get('/painelpodcasts', eUser, function(req, res){
  Podcast.find().lean().sort({_id: -1}).then(function(podcasts){
      res.render('admin/painelpodcasts', {podcasts: podcasts})
  })
})

router.get('/publicarepisodio', eUser, (req, res) => {
    res.render('admin/publicarepisodio')
})

router.post('/publicarepisodio', eUser, (req, res) => {
    var erros = []

    if(!req.body.content || typeof req.body.content == undefined || req.body.content == null){
        erros.push({texto: 'Episódio sem conteúdo.'})
    }

    if(!req.body.title || typeof req.body.title == undefined || req.body.title == null){
        erros.push({texto: 'Episódio sem título.'})
    }

    if(!req.body.link || typeof req.body.link == undefined || req.body.link == null){
        erros.push({texto: 'Episódio sem link do spotify.'})
    }

    if(erros.legth > 0){
        res.render('admin/publicaepisodio', {erros: erros})
    }else {
       const novoEpisodio = {
           title: req.body.title,
           data: req.body.data,
           content: req.body.content,
           autor: req.user.nome,
           link: req.body.link
       } 

       new Podcast(novoEpisodio).save().then(() => {
           req.flash('success_msg','Episodio publicado.')
           res.redirect('/admin/painel')
       }).catch((err) => {
           req.flash('error_msg','Houve um erro ao publicar episódio.')
           res.redirect('/admin/publicarepisodio')
       })
    }
})

router.get('/editarpodcast/:id', eUser, (req, res) => {
    Podcast.findOne({_id: req.params.id}).lean().then((podcasts) => {
        res.render('admin/editarpodcast', {podcasts: podcasts})
    }).catch((err) => {
        req.flash('error_msg', 'Erro interno.')
        res.redirect('/admin/painelpodcasts')
    })
})

router.post('/editarpodcast', eUser, (req, res) => {
    Podcast.findOne({ _id: req.body.id }).then((podcasts) => {
        podcasts.title = req.body.title;
        podcasts.content = req.body.content;
        podcasts.data = req.body.data;
        podcasts.link = req.body.link;

        podcasts.save().lean().then(() => {
            req.flash('success_msg', 'Episodio editado com sucesso.')
            res.redirect('/admin/painelpodcasts')
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno.')
            res.redirect('/admin/editarpodcast')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao salvar edição.')
        res.redirect('/admin/editarpodcast')
    })
})

router.get('/excluirpodcast/:id', eUser, (req, res) => {
    Podcast.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Episódio excluido com sucesso.')
        res.redirect('/admin/painelpodcasts')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir.')
        res.redirect('/admin/painelpodcasts')
    })
})



module.exports = router