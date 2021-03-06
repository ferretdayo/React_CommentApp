import * as React from "react";

import {CommentData} from "./CommentData"
import {CommentForm} from "./CommentForm"
import {CommentList} from "./CommentList"

interface CommentBoxProps{
    url: string;
    pollInterval: number;
}

export interface CommentBoxState{
    data: CommentData[];
}

export class CommentBox extends React.Component<CommentBoxProps, CommentBoxState> {
    constructor(props: CommentBoxProps){
        super(props);
        //stateの初期化
        this.state = {data: []};
        this.loadCommentsFromServer = this.loadCommentsFromServer.bind(this);
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    }
    //コメントをサーバから取得する関数
    loadCommentsFromServer() {                                           
        $.ajax({                                                                     
            url: this.props.url,                                                       
            dataType: 'json',                                                          
            cache: false,                                                              
            success: function(data: any) {
                //現在のコメント情報をstateに記憶させる                                                  
                this.setState({data: data});                                             
            }.bind(this),                                                              
            error: function(xhr: any, status: any, err: any) {                                        
                console.error(this.props.url, status, err.toString());                   
            }.bind(this)                                                     
        });                                                                              
    }
    //Submitされたときに呼び出される関数                                                                      
    handleCommentSubmit(comment: CommentData) {
        //今のコメントリストの情報を取得
        var comments = this.state.data;                                              
        // Optimistically set an id on the new comment. It will be replaced by an    
        // id generated by the server. In a production application you would likely  
        // not use Date.now() for this and would have a more robust system in place. 
        comment.id = Date.now();
        //新しいコメントを現在のコメントリストの後に追加                                                   
        var newComments = comments.concat([comment]);
        //コメントリストの情報を更新                                
        this.setState({data: newComments});                                          
        $.ajax({                                                                     
            url: this.props.url,                                                       
            dataType: 'json',                                                          
            type: 'POST',                                                              
            data: comment,                                                             
            success: function(data: any) {
                //現在のコメントリストの情報を更新                                              
                this.setState({data: data});                                             
            }.bind(this),                                                              
            error: function(xhr: any, status: any, err: any) {
                //前のコメント情報に戻す                                        
                this.setState({data: comments});                                         
                console.error(this.props.url, status, err.toString());                   
            }.bind(this)                                                               
        });                                                                          
    }
    //1回のみ呼ばれる                                                  
    componentDidMount() {                                      
        this.loadCommentsFromServer();                                               
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);           
    }                                                                            
    render() {                                                           
        return (                                                              
        <div className="commentBox">                                               
            <h1>Comments</h1>                                                        
            <CommentList data={this.state.data} />                                   
            <CommentForm onCommentSubmit={this.handleCommentSubmit} />               
        </div>                                                                     
        );                                                                           
    }                                                                              
}                                                                      